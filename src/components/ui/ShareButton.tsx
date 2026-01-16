'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareData = {
      title,
      text: text || title,
      url: shareUrl,
    };

    // Try native share API first (mobile)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fall back to clipboard copy
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      aria-label={copied ? 'Link copied!' : 'Share this article'}
      className="share-button no-print"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-1" aria-hidden="true" />
          Share
        </>
      )}
    </Button>
  );
}
