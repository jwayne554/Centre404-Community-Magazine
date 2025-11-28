'use client';

import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { Heart } from 'lucide-react';

// Module-level cache for sessionId - survives component remounts
let cachedSessionId: string | null = null;

/**
 * Get or create a persistent session ID for anonymous like tracking.
 * Uses localStorage with fallback to in-memory cache if localStorage fails.
 */
function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  // Return cached value if available
  if (cachedSessionId) return cachedSessionId;

  try {
    // Try to get from localStorage
    let sessionId = localStorage.getItem('likeSessionId');

    if (!sessionId) {
      // Generate new UUID
      sessionId = crypto.randomUUID();

      // Try to persist to localStorage
      try {
        localStorage.setItem('likeSessionId', sessionId);
      } catch (storageError) {
        // localStorage write failed (quota exceeded, incognito mode, etc.)
        // Continue with the generated ID - it will work for this session
        console.warn('Could not persist sessionId to localStorage:', storageError);
      }
    }

    // Cache in memory for consistency
    cachedSessionId = sessionId;
    return sessionId;
  } catch (error) {
    // localStorage read failed - generate a session-only ID
    console.warn('localStorage not available:', error);
    if (!cachedSessionId) {
      cachedSessionId = crypto.randomUUID();
    }
    return cachedSessionId;
  }
}

interface LikeButtonProps {
  magazineId: string;
  magazineItemId: string;
  initialLikeCount?: number;
}

export default function LikeButton({
  magazineId,
  magazineItemId,
  initialLikeCount = 0
}: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Store sessionId in a ref to ensure consistency within component lifecycle
  const sessionIdRef = useRef<string | null>(null);

  // Initialize sessionId once on mount
  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Fetch initial like status
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        // Use the cached sessionId for consistency
        const sessionId = sessionIdRef.current || getSessionId();
        const url = sessionId
          ? `/api/magazines/${magazineId}/likes?sessionId=${encodeURIComponent(sessionId)}`
          : `/api/magazines/${magazineId}/likes`;

        console.log('[LikeButton] Fetching likes with sessionId:', sessionId);

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('[LikeButton] Fetch response:', data);

          if (data.success && data.data[magazineItemId]) {
            setLikeCount(data.data[magazineItemId].count);
            setLiked(data.data[magazineItemId].userLiked);
            console.log('[LikeButton] Set liked:', data.data[magazineItemId].userLiked, 'count:', data.data[magazineItemId].count);
          }
        }
      } catch (error) {
        console.error('[LikeButton] Failed to fetch likes:', error);
      }
    };

    // Small delay to ensure sessionIdRef is initialized
    const timer = setTimeout(fetchLikes, 50);
    return () => clearTimeout(timer);
  }, [magazineId, magazineItemId]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    // Use the cached sessionId for consistency
    const sessionId = sessionIdRef.current || getSessionId();
    console.log('[LikeButton] handleLike with sessionId:', sessionId);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/magazines/${magazineId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          magazineItemId,
          sessionId,
        }),
      });

      const data = await response.json();
      console.log('[LikeButton] POST response:', response.status, data);

      if (response.ok && data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
        console.log('[LikeButton] Like updated - liked:', data.data.liked, 'count:', data.data.likeCount);
      } else {
        // Rollback on error
        console.error('[LikeButton] POST failed:', data.error || response.statusText);
        setLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      // Rollback on error
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('[LikeButton] Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      icon={
        <Heart
          className={`h-4 w-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`}
        />
      }
      onClick={handleLike}
      disabled={isLoading}
      className={`text-sm ${liked ? 'border-red-200 bg-red-50 hover:bg-red-100' : ''}`}
    >
      {likeCount > 0 ? likeCount : 'Like'}
    </Button>
  );
}
