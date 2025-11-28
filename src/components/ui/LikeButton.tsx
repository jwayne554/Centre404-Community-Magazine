'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import { Heart } from 'lucide-react';

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

  // Generate or retrieve session ID for tracking likes
  const getSessionId = () => {
    if (typeof window === 'undefined') return null;

    let sessionId = localStorage.getItem('likeSessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('likeSessionId', sessionId);
    }
    return sessionId;
  };

  // Fetch initial like status
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const sessionId = getSessionId();
        const url = sessionId
          ? `/api/magazines/${magazineId}/likes?sessionId=${sessionId}`
          : `/api/magazines/${magazineId}/likes`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data[magazineItemId]) {
            setLikeCount(data.data[magazineItemId].count);
            setLiked(data.data[magazineItemId].userLiked);
          }
        }
      } catch (error) {
        console.error('Failed to fetch likes:', error);
      }
    };

    fetchLikes();
  }, [magazineId, magazineItemId]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const sessionId = getSessionId();

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

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLiked(data.data.liked);
          setLikeCount(data.data.likeCount);
        }
      } else {
        // Rollback on error
        setLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      // Rollback on error
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle like:', error);
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
