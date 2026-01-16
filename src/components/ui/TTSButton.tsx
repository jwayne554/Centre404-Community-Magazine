'use client';

import { useTTSPlayback } from '@/hooks/useTTSPlayback';
import Button from '@/components/ui/Button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface TTSButtonProps {
  text: string;
  label?: string;
}

export default function TTSButton({ text, label }: TTSButtonProps) {
  const { toggle, isPlaying, isLoading } = useTTSPlayback();

  if (!text || !text.trim()) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggle(text)}
      disabled={isLoading}
      aria-label={isPlaying ? 'Stop reading aloud' : 'Read aloud'}
      aria-pressed={isPlaying}
      className="no-print"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden="true" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4 mr-1" aria-hidden="true" />
      ) : (
        <Volume2 className="h-4 w-4 mr-1" aria-hidden="true" />
      )}
      {label || (isPlaying ? 'Stop' : 'Listen')}
    </Button>
  );
}
