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
  initialLiked?: boolean;
}

export default function LikeButton({
  magazineId,
  magazineItemId,
  initialLikeCount = 0,
  initialLiked = false
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Store sessionId in a ref to ensure consistency within component lifecycle
  const sessionIdRef = useRef<string | null>(null);

  // Initialize sessionId once on mount
  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Only fetch likes if we need to check session-specific like status
  // Skip if initialLiked was provided (server already checked)
  useEffect(() => {
    // If we already have initial values and haven't checked session yet,
    // we should verify the session's like status (in case sessionId differs)
    if (hasCheckedSession) return;

    const checkSessionLikes = async () => {
      try {
        const sessionId = sessionIdRef.current || getSessionId();
        if (!sessionId) return;

        // Quick check for this session's like status
        const url = `/api/magazines/${magazineId}/likes?sessionId=${encodeURIComponent(sessionId)}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data[magazineItemId]) {
            // Only update liked status based on session, keep server count
            setLiked(data.data[magazineItemId].userLiked);
            // Update count too in case it changed
            setLikeCount(data.data[magazineItemId].count);
          }
        }
      } catch (error) {
        // Silent fail - we already have initial values
      } finally {
        setHasCheckedSession(true);
      }
    };

    // Small delay to ensure sessionIdRef is initialized
    const timer = setTimeout(checkSessionLikes, 100);
    return () => clearTimeout(timer);
  }, [magazineId, magazineItemId, hasCheckedSession]);

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
        console.error('[LikeButton] POST failed:', data.error, 'Details:', data.details || 'none');
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
