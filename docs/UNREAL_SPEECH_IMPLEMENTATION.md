# Unreal Speech TTS Implementation Plan
**Date:** 2025-11-11
**Goal:** Replace robotic Web Speech API with natural Unreal Speech voices
**Status:** Ready to implement

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User clicks "Listen"                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Client Component (magazine-viewer)              │
│  • Check cache first (IndexedDB/localStorage)                │
│  • Show loading state                                        │
│  • Call TTS service                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   TTS Service Layer                          │
│  • Select endpoint (/stream for <1k, /speech for longer)    │
│  • Handle retries                                            │
│  • Fallback to Web Speech API on error                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Next.js API Route (/api/tts/unrealspeech)        │
│  • Server-side only (protects API key)                      │
│  • Calls Unreal Speech API                                  │
│  • Returns audio blob                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Unreal Speech API                          │
│  • Generates natural-sounding audio                          │
│  • Returns MP3 stream                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Play Audio                              │
│  • Create Audio object                                       │
│  • Play with controls                                        │
│  • Cache for future use                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Unreal Speech API Details

### Endpoints:

| Endpoint | Character Limit | Response Time | Use Case |
|----------|----------------|---------------|----------|
| **/stream** | 1,000 chars | Instant (300ms) | Short stories, quick audio |
| **/speech** | 3,000 chars | ~1-2 seconds | Medium stories |
| **/synthesisTasks** | 500,000 chars | ~1s per 800 chars | Long content (async) |

### Available Voices:
- **Scarlett** (Female, American)
- **Dan** (Male, American)
- **Liv** (Female, British)
- **Will** (Male, British)
- **Amy** (Female, Australian)

### Parameters:
```typescript
{
  Text: string,
  VoiceId: 'Scarlett' | 'Dan' | 'Liv' | 'Will' | 'Amy',
  Bitrate: '192k' | '256k' | '320k',
  Speed: -1.0 to 1.0,  // 0 = normal
  Pitch: 0.5 to 1.5,   // 1 = normal
  Codec: 'libmp3lame'  // MP3 format
}
```

---

## Implementation Steps

### Step 1: Environment Variables ✅

Add to `.env.local`:
```bash
# Unreal Speech TTS
UNREAL_SPEECH_API_KEY="your_api_key_here"
NEXT_PUBLIC_ENABLE_PREMIUM_TTS="true"
```

Add to `.env.example`:
```bash
# Unreal Speech TTS (Optional - for natural voices)
UNREAL_SPEECH_API_KEY="your-api-key"
NEXT_PUBLIC_ENABLE_PREMIUM_TTS="true"
```

---

### Step 2: Create API Route ✅

**File:** `src/app/api/tts/unrealspeech/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const UNREAL_SPEECH_API_URL = 'https://api.v8.unrealspeech.com';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = 'Scarlett', speed = 0, pitch = 1.0 } = await request.json();

    // Validate API key
    const apiKey = process.env.UNREAL_SPEECH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unreal Speech API key not configured' },
        { status: 500 }
      );
    }

    // Validate text length
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Select endpoint based on text length
    const charCount = text.length;
    const endpoint = charCount <= 1000 ? '/stream' : '/speech';

    console.log(`[TTS] Generating audio for ${charCount} characters using ${endpoint}`);

    // Call Unreal Speech API
    const response = await fetch(`${UNREAL_SPEECH_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Text: text,
        VoiceId: voiceId,
        Bitrate: '192k',  // Good quality, reasonable size
        Speed: speed,
        Pitch: pitch,
        Codec: 'libmp3lame',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] Unreal Speech API error:', errorText);

      // Check for quota exceeded
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'TTS quota exceeded', fallback: true },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate speech', fallback: true },
        { status: response.status }
      );
    }

    // For /stream endpoint, response is directly the audio
    if (endpoint === '/stream') {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    }

    // For /speech endpoint, response is JSON with URL
    const data = await response.json();
    return NextResponse.json({
      audioUrl: data.OutputUri,
      duration: data.meta?.DurationSeconds,
    });

  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fallback: true },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check status
export async function GET() {
  const apiKey = process.env.UNREAL_SPEECH_API_KEY;
  const enabled = process.env.NEXT_PUBLIC_ENABLE_PREMIUM_TTS === 'true';

  return NextResponse.json({
    enabled,
    configured: !!apiKey,
    provider: 'Unreal Speech',
  });
}
```

---

### Step 3: Create TTS Service Layer ✅

**File:** `src/services/tts.service.ts`

```typescript
/**
 * Text-to-Speech Service
 * Handles TTS generation with Unreal Speech API and fallback to Web Speech API
 */

// Cache for generated audio
const audioCache = new Map<string, Blob>();

export interface TTSOptions {
  voiceId?: 'Scarlett' | 'Dan' | 'Liv' | 'Will' | 'Amy';
  speed?: number;  // -1.0 to 1.0
  pitch?: number;  // 0.5 to 1.5
  useCache?: boolean;
}

export interface TTSResult {
  audioBlob?: Blob;
  audioUrl?: string;
  usedFallback: boolean;
  provider: 'unrealspeech' | 'webspeech';
  cached: boolean;
}

/**
 * Generate speech using Unreal Speech API or fallback to Web Speech API
 */
export async function generateSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  const {
    voiceId = 'Scarlett',
    speed = 0,
    pitch = 1.0,
    useCache = true,
  } = options;

  // Check cache first
  const cacheKey = `${text}-${voiceId}-${speed}-${pitch}`;
  if (useCache && audioCache.has(cacheKey)) {
    console.log('[TTS] Using cached audio');
    const cachedBlob = audioCache.get(cacheKey)!;
    return {
      audioBlob: cachedBlob,
      audioUrl: URL.createObjectURL(cachedBlob),
      usedFallback: false,
      provider: 'unrealspeech',
      cached: true,
    };
  }

  // Try Unreal Speech API
  try {
    const response = await fetch('/api/tts/unrealspeech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId,
        speed,
        pitch,
      }),
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('audio')) {
        // Direct audio stream
        const audioBlob = await response.blob();

        // Cache the audio
        if (useCache) {
          audioCache.set(cacheKey, audioBlob);

          // Limit cache size (remove oldest if >50 items)
          if (audioCache.size > 50) {
            const firstKey = audioCache.keys().next().value;
            audioCache.delete(firstKey);
          }
        }

        return {
          audioBlob,
          audioUrl: URL.createObjectURL(audioBlob),
          usedFallback: false,
          provider: 'unrealspeech',
          cached: false,
        };
      } else {
        // JSON response with URL
        const data = await response.json();

        if (data.audioUrl) {
          // Fetch the audio from the URL
          const audioResponse = await fetch(data.audioUrl);
          const audioBlob = await audioResponse.blob();

          if (useCache) {
            audioCache.set(cacheKey, audioBlob);
          }

          return {
            audioBlob,
            audioUrl: URL.createObjectURL(audioBlob),
            usedFallback: false,
            provider: 'unrealspeech',
            cached: false,
          };
        }
      }
    }

    // If quota exceeded or error, fall back
    const errorData = await response.json();
    if (errorData.fallback) {
      console.warn('[TTS] Falling back to Web Speech API:', errorData.error);
      return useFallbackTTS(text, speed, pitch);
    }

    throw new Error('Failed to generate speech');

  } catch (error) {
    console.error('[TTS] Unreal Speech failed, using fallback:', error);
    return useFallbackTTS(text, speed, pitch);
  }
}

/**
 * Fallback to Web Speech API
 */
function useFallbackTTS(text: string, speed: number, pitch: number): TTSResult {
  return {
    usedFallback: true,
    provider: 'webspeech',
    cached: false,
  };
}

/**
 * Play audio from blob or use Web Speech API fallback
 */
export async function playAudio(
  text: string,
  options: TTSOptions = {},
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const result = await generateSpeech(text, options);

    if (result.audioBlob && result.audioUrl) {
      // Play using Audio API
      const audio = new Audio(result.audioUrl);

      audio.onplay = () => onStart?.();
      audio.onended = () => {
        URL.revokeObjectURL(result.audioUrl!);
        onEnd?.();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(result.audioUrl!);
        onError?.(new Error('Audio playback failed'));
      };

      await audio.play();
    } else {
      // Use Web Speech API fallback
      if (!('speechSynthesis' in window)) {
        throw new Error('Text-to-speech not supported');
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85 + (options.speed || 0) * 0.15;
      utterance.pitch = options.pitch || 1.0;

      utterance.onstart = () => onStart?.();
      utterance.onend = () => onEnd?.();
      utterance.onerror = (e) => onError?.(new Error(e.error));

      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('TTS failed'));
  }
}

/**
 * Stop any currently playing audio
 */
export function stopAudio(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Stop all audio elements
  document.querySelectorAll('audio').forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/**
 * Clear audio cache
 */
export function clearAudioCache(): void {
  audioCache.clear();
  console.log('[TTS] Audio cache cleared');
}

/**
 * Get cache size
 */
export function getCacheSize(): number {
  return audioCache.size;
}
```

---

### Step 4: Update Magazine Viewer Component ✅

**File:** `src/components/magazine/magazine-viewer.tsx`

Replace the `speakText` function with:

```typescript
import { playAudio, stopAudio } from '@/services/tts.service';
import { useState } from 'react';

// ... existing imports and code ...

export function MagazineViewer({ magazine }: MagazineViewerProps) {
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);

  // ... existing code ...

  const handleSpeak = async (text: string, id: string) => {
    // Stop if already speaking this item
    if (currentlySpeaking === id) {
      stopAudio();
      setCurrentlySpeaking(null);
      return;
    }

    // Stop any other audio
    stopAudio();
    setCurrentlySpeaking(null);

    // Start loading
    setIsLoadingAudio(id);

    try {
      await playAudio(
        text,
        {
          voiceId: 'Scarlett', // or make this configurable
          speed: 0,
          pitch: 1.0,
          useCache: true,
        },
        // onStart
        () => {
          setIsLoadingAudio(null);
          setCurrentlySpeaking(id);
        },
        // onEnd
        () => {
          setCurrentlySpeaking(null);
        },
        // onError
        (error) => {
          console.error('[TTS] Playback error:', error);
          setIsLoadingAudio(null);
          setCurrentlySpeaking(null);
          alert('Failed to play audio. Please try again.');
        }
      );
    } catch (error) {
      console.error('[TTS] Error:', error);
      setIsLoadingAudio(null);
      setCurrentlySpeaking(null);
    }
  };

  // ... rest of component ...

  // Update the Listen button
  const isCurrentlySpeaking = currentlySpeaking === submission.id;
  const isLoading = isLoadingAudio === submission.id;

  return (
    // ... existing JSX ...

    <Button
      variant="ghost"
      size="sm"
      className={`flex-1 ${isCurrentlySpeaking ? 'bg-primary/10' : ''}`}
      onClick={() => handleSpeak(submission.textContent!, submission.id)}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Volume2 className={`mr-1 h-4 w-4 ${isCurrentlySpeaking ? 'animate-pulse' : ''}`} />
          {isCurrentlySpeaking ? 'Stop' : 'Listen'}
        </>
      )}
    </Button>

    // ... rest of JSX ...
  );
}
```

**Don't forget to import Loader2:**
```typescript
import { Volume2, Loader2 } from 'lucide-react';
```

---

### Step 5: Update Simple Magazine Viewer ✅

**File:** `src/components/magazine/simple-magazine-viewer.tsx`

Apply the same changes as above to the simple viewer component.

---

### Step 6: Add Environment Variables ✅

**Update `.env.local`:**
```bash
# Add your Unreal Speech API key
UNREAL_SPEECH_API_KEY="your_actual_api_key_here"
NEXT_PUBLIC_ENABLE_PREMIUM_TTS="true"
```

**Update `.env.example`:**
```bash
# Unreal Speech TTS (Optional - for natural voices)
UNREAL_SPEECH_API_KEY="your-api-key"
NEXT_PUBLIC_ENABLE_PREMIUM_TTS="true"
```

---

## Testing Checklist

### Unit Tests:
- [ ] TTS API route returns audio for short text (<1000 chars)
- [ ] TTS API route returns audio URL for long text (>1000 chars)
- [ ] API route handles missing API key gracefully
- [ ] API route handles quota exceeded (429) error
- [ ] Service layer caches audio correctly
- [ ] Service layer falls back to Web Speech API on error
- [ ] Service layer limits cache size

### Integration Tests:
- [ ] Click "Listen" button generates audio
- [ ] Loading spinner shows while generating
- [ ] Audio plays after generation
- [ ] "Stop" button stops audio
- [ ] Multiple submissions can be played sequentially
- [ ] Cache reduces API calls for same text
- [ ] Fallback to Web Speech API works when API fails

### User Acceptance:
- [ ] Voice sounds natural (not robotic)
- [ ] Audio quality is clear
- [ ] Loading time is acceptable (<2 seconds)
- [ ] No errors with different story lengths
- [ ] Works on different browsers
- [ ] Accessible with keyboard navigation
- [ ] Screen reader announces audio state changes

---

## Cost Monitoring

**Track Usage:**
```typescript
// Optional: Add usage tracking
let totalCharsGenerated = 0;

export function trackUsage(charCount: number): void {
  totalCharsGenerated += charCount;
  console.log(`[TTS] Total chars generated: ${totalCharsGenerated}`);

  // Warn if approaching free tier limit
  if (totalCharsGenerated > 200000) {
    console.warn('[TTS] Approaching free tier limit (250k chars)');
  }
}
```

---

## Performance Optimization

### 1. Prefetch Audio for Published Magazines
```typescript
// Optionally pre-generate audio when magazine is published
export async function prefetchMagazineAudio(magazine: Magazine): Promise<void> {
  for (const item of magazine.items) {
    if (item.submission.textContent) {
      await generateSpeech(item.submission.textContent, { useCache: true });
    }
  }
}
```

### 2. IndexedDB for Persistent Cache
```typescript
// Upgrade from Map to IndexedDB for persistent caching across sessions
import { openDB } from 'idb';

const dbPromise = openDB('tts-cache', 1, {
  upgrade(db) {
    db.createObjectStore('audio');
  },
});

export async function getCachedAudio(key: string): Promise<Blob | undefined> {
  const db = await dbPromise;
  return await db.get('audio', key);
}

export async function setCachedAudio(key: string, blob: Blob): Promise<void> {
  const db = await dbPromise;
  await db.put('audio', blob, key);
}
```

---

## Rollout Strategy

### Phase 1: Testing (Week 1)
- Deploy to development environment
- Test with internal team
- Verify all edge cases
- Monitor API usage

### Phase 2: Beta (Week 2)
- Enable for admin users only
- Collect feedback
- Monitor costs
- Fix any issues

### Phase 3: Production (Week 3)
- Enable for all users
- Monitor performance
- Track user engagement
- Optimize based on usage patterns

---

## Troubleshooting

### Issue: "TTS quota exceeded"
**Solution:** Service automatically falls back to Web Speech API. Consider upgrading Unreal Speech plan if this happens frequently.

### Issue: Audio doesn't play
**Solution:** Check browser console for errors. Ensure CORS is properly configured. Verify audio format is supported.

### Issue: Slow response times
**Solution:** Use `/stream` endpoint for texts <1000 chars. Consider prefetching audio for published magazines.

### Issue: API key not working
**Solution:** Verify key is correct in `.env.local`. Restart development server after changing environment variables.

---

## Configuration Options

### Voice Selection by User Role
```typescript
// Admin panel: allow voice selection
const VOICE_OPTIONS = [
  { id: 'Scarlett', label: 'Scarlett (Female, American)' },
  { id: 'Dan', label: 'Dan (Male, American)' },
  { id: 'Liv', label: 'Liv (Female, British)' },
  { id: 'Will', label: 'Will (Male, British)' },
  { id: 'Amy', label: 'Amy (Female, Australian)' },
];

// Allow users to select preferred voice in accessibility settings
```

### Speed and Pitch Controls
```typescript
// Add UI controls for speed and pitch
<Slider
  label="Speech Speed"
  min={-1}
  max={1}
  step={0.1}
  value={speed}
  onChange={setSpeed}
/>

<Slider
  label="Voice Pitch"
  min={0.5}
  max={1.5}
  step={0.1}
  value={pitch}
  onChange={setPitch}
/>
```

---

## Next Steps

1. ✅ **Add API key to environment** (.env.local)
2. ✅ **Create API route** (src/app/api/tts/unrealspeech/route.ts)
3. ✅ **Create service layer** (src/services/tts.service.ts)
4. ✅ **Update magazine viewer** (both components)
5. ✅ **Test thoroughly** (all edge cases)
6. ✅ **Deploy** (development → staging → production)
7. ✅ **Monitor usage** (track API calls and costs)
8. ✅ **Collect feedback** (user satisfaction with natural voices)

---

## Success Metrics

- **Voice Quality:** User feedback on naturalness
- **Performance:** Average audio generation time <2 seconds
- **Reliability:** <1% fallback rate to Web Speech API
- **Cost:** Stay within free tier (250k chars/month)
- **Usage:** Increase in "Listen" button clicks
- **Accessibility:** Positive feedback from users with disabilities
