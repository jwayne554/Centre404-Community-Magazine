/**
 * Hook for managing text-to-speech playback
 * Task 3.3: Extract Custom Hooks
 */

import { useState, useCallback, useEffect } from 'react';
import { playAudio, stopAudio, isPlaying, TTSOptions } from '@/services/tts.service';

interface UseTTSPlaybackOptions extends TTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTTSPlayback(options: UseTTSPlaybackOptions = {}) {
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);

  // Check playing state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const playing = isPlaying();
      if (playing !== isPlayingState) {
        setIsPlayingState(playing);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlayingState]);

  const play = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) {
        setError('No text provided');
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentText(text);

      try {
        await playAudio(text, options, {
          onStart: () => {
            setIsLoading(false);
            setIsPlayingState(true);
            options.onStart?.();
          },
          onEnd: () => {
            setIsPlayingState(false);
            setCurrentText(null);
            options.onEnd?.();
          },
          onError: (errorMessage: string) => {
            setError(errorMessage);
            setIsLoading(false);
            setIsPlayingState(false);
            setCurrentText(null);
            options.onError?.(errorMessage);
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to play audio';
        setError(errorMessage);
        setIsLoading(false);
        setIsPlayingState(false);
        setCurrentText(null);
        options.onError?.(errorMessage);
      }
    },
    [options]
  );

  const stop = useCallback(() => {
    stopAudio();
    setIsPlayingState(false);
    setIsLoading(false);
    setCurrentText(null);
    setError(null);
  }, []);

  const toggle = useCallback(
    async (text: string) => {
      if (isPlayingState || isLoading) {
        stop();
      } else {
        await play(text);
      }
    },
    [isPlayingState, isLoading, play, stop]
  );

  return {
    play,
    stop,
    toggle,
    isPlaying: isPlayingState,
    isLoading,
    error,
    currentText,
  };
}
