/**
 * Text-to-Speech Service
 *
 * Provides natural voice generation using Unreal Speech API with automatic
 * fallback to browser Web Speech API. Includes caching for optimal performance.
 */

// Audio cache to avoid redundant API calls
const audioCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

// Currently playing audio element
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export interface TTSOptions {
  voiceId?: 'Scarlett' | 'Dan' | 'Liv' | 'Will' | 'Amy';
  speed?: number; // -1.0 to 1.0 (0 is normal)
  pitch?: number; // 0.5 to 1.5 (1.0 is normal)
}

export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  usedFallback: boolean;
  error?: string;
}

/**
 * Generate speech audio from text using Unreal Speech API
 * Returns cached URL if available, otherwise calls API
 */
export async function generateSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  try {
    // Check cache first
    const cacheKey = `${text}-${options.voiceId || 'Scarlett'}-${options.speed || 0}-${options.pitch || 1.0}`;

    if (audioCache.has(cacheKey)) {
      return {
        success: true,
        audioUrl: audioCache.get(cacheKey)!,
        usedFallback: false,
      };
    }

    // Check if premium TTS is enabled
    const statusResponse = await fetch('/api/tts/unrealspeech');
    const status = await statusResponse.json();

    if (!status.enabled || !status.configured) {
      console.warn('[TTS] Premium TTS not configured, using fallback');
      return {
        success: false,
        usedFallback: true,
        error: 'Premium TTS not configured',
      };
    }

    // Call Unreal Speech API via our proxy
    const response = await fetch('/api/tts/unrealspeech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId: options.voiceId || 'Scarlett',
        speed: options.speed || 0,
        pitch: options.pitch || 1.0,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.warn('[TTS] API error:', data.error);

      // Check if we should fallback
      if (data.fallback) {
        return {
          success: false,
          usedFallback: true,
          error: data.error,
        };
      }

      throw new Error(data.error);
    }

    // For /stream endpoint, response is audio blob
    const contentType = response.headers.get('content-type');
    if (contentType === 'audio/mpeg') {
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Add to cache
      addToCache(cacheKey, audioUrl);

      return {
        success: true,
        audioUrl,
        usedFallback: false,
      };
    }

    // For /speech endpoint, response is JSON with URL
    const data = await response.json();
    if (data.audioUrl) {
      // Add to cache
      addToCache(cacheKey, data.audioUrl);

      return {
        success: true,
        audioUrl: data.audioUrl,
        usedFallback: false,
      };
    }

    throw new Error('No audio URL in response');

  } catch (error) {
    console.error('[TTS] Error generating speech:', error);
    return {
      success: false,
      usedFallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Play audio from URL or fallback to Web Speech API
 */
export async function playAudio(
  text: string,
  options: TTSOptions = {},
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }
): Promise<void> {
  // Stop any currently playing audio
  stopAudio();

  try {
    // Try to generate speech with Unreal Speech
    const result = await generateSpeech(text, options);

    if (result.success && result.audioUrl) {
      // Play using HTML5 Audio
      return playHTMLAudio(result.audioUrl, callbacks);
    } else if (result.usedFallback) {
      // Fallback to Web Speech API
      console.log('[TTS] Using Web Speech API fallback');
      return playWebSpeechAPI(text, options, callbacks);
    } else {
      throw new Error(result.error || 'Failed to generate speech');
    }
  } catch (error) {
    console.error('[TTS] Error playing audio:', error);

    // Final fallback to Web Speech API
    console.log('[TTS] Using Web Speech API as final fallback');
    return playWebSpeechAPI(text, options, callbacks);
  }
}

/**
 * Play audio using HTML5 Audio element
 */
function playHTMLAudio(
  audioUrl: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    currentAudio = new Audio(audioUrl);

    currentAudio.onloadeddata = () => {
      callbacks?.onStart?.();
    };

    currentAudio.onended = () => {
      callbacks?.onEnd?.();
      currentAudio = null;
      resolve();
    };

    currentAudio.onerror = () => {
      const error = 'Failed to load audio';
      callbacks?.onError?.(error);
      currentAudio = null;
      reject(new Error(error));
    };

    currentAudio.play().catch((error) => {
      callbacks?.onError?.(error.message);
      currentAudio = null;
      reject(error);
    });
  });
}

/**
 * Play audio using Web Speech API (fallback)
 */
function playWebSpeechAPI(
  text: string,
  options: TTSOptions = {},
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      const error = 'Web Speech API not supported in this browser';
      callbacks?.onError?.(error);
      reject(new Error(error));
      return;
    }

    window.speechSynthesis.cancel();
    currentUtterance = new SpeechSynthesisUtterance(text);

    // Map Unreal Speech speed (-1.0 to 1.0) to Web Speech rate (0.1 to 10)
    // Unreal Speech: 0 = normal, -1 = slowest, 1 = fastest
    // Web Speech: 1 = normal, 0.1 = slowest, 10 = fastest
    const speed = options.speed || 0;
    currentUtterance.rate = speed >= 0 ? 1 + speed : 1 + (speed * 0.9);

    currentUtterance.pitch = options.pitch || 1.0;

    currentUtterance.onstart = () => {
      callbacks?.onStart?.();
    };

    currentUtterance.onend = () => {
      callbacks?.onEnd?.();
      currentUtterance = null;
      resolve();
    };

    currentUtterance.onerror = (event) => {
      const error = `Web Speech API error: ${event.error}`;
      callbacks?.onError?.(error);
      currentUtterance = null;
      reject(new Error(error));
    };

    window.speechSynthesis.speak(currentUtterance);
  });
}

/**
 * Stop currently playing audio
 */
export function stopAudio(): void {
  // Stop HTML5 Audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Stop Web Speech API
  if (currentUtterance || window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Check if audio is currently playing
 */
export function isPlaying(): boolean {
  return (currentAudio !== null && !currentAudio.paused) ||
         window.speechSynthesis.speaking;
}

/**
 * Add audio URL to cache with size limit
 */
function addToCache(key: string, audioUrl: string): void {
  // If cache is full, remove oldest entry
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const firstKey = audioCache.keys().next().value;
    const firstUrl = audioCache.get(firstKey);

    // Revoke blob URL if it exists
    if (firstUrl && firstUrl.startsWith('blob:')) {
      URL.revokeObjectURL(firstUrl);
    }

    audioCache.delete(firstKey);
  }

  audioCache.set(key, audioUrl);
}

/**
 * Clear audio cache and revoke blob URLs
 */
export function clearAudioCache(): void {
  // Revoke all blob URLs
  audioCache.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });

  audioCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: audioCache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}
