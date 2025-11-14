'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryEmoji, getCategoryColor, getCategoryName } from '@/utils/category-helpers';
import { useMagazineData } from '@/hooks/useMagazineData';
import { useTTSPlayback } from '@/hooks/useTTSPlayback';
import { MagazineViewerSkeleton } from '@/components/skeletons/magazine-skeleton';
import Layout from '@/components/ui/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, Heart, Volume2, ChevronDown, ChevronUp } from 'lucide-react';

// Generate or retrieve session ID for anonymous users
const getSessionId = () => {
  if (typeof window === 'undefined') return null;

  let sessionId = localStorage.getItem('magazine_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('magazine_session_id', sessionId);
  }
  return sessionId;
};

export default function MagazinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { magazine, isLoading: loading } = useMagazineData({
    magazineId: resolvedParams.id,
    publicOnly: true,
  });
  const { play: speakText } = useTTSPlayback();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Fetch likes when magazine loads
  useEffect(() => {
    if (magazine && sessionId) {
      fetchLikes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magazine, sessionId]);

  const fetchLikes = async () => {
    if (!magazine) return;

    try {
      const response = await fetch(`/api/magazines/${magazine.id}/likes`);
      const result = await response.json();

      if (result.success) {
        const counts: Record<string, number> = {};
        Object.entries(result.data).forEach(([itemId, data]) => {
          counts[itemId] = (data as { count: number }).count;
        });
        setLikeCounts(counts);
      }
    } catch (error) {
      console.error('Failed to fetch likes:', error);
    }
  };

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedItems(newSet);
  };

  const toggleLike = async (itemId: string) => {
    if (!magazine || !sessionId) return;

    // Optimistic UI update
    const wasLiked = likedItems.has(itemId);
    const newLikedItems = new Set(likedItems);
    if (wasLiked) {
      newLikedItems.delete(itemId);
    } else {
      newLikedItems.add(itemId);
    }
    setLikedItems(newLikedItems);

    // Update like count optimistically
    const newCounts = { ...likeCounts };
    newCounts[itemId] = (newCounts[itemId] || 0) + (wasLiked ? -1 : 1);
    setLikeCounts(newCounts);

    try {
      const response = await fetch(`/api/magazines/${magazine.id}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          magazineItemId: itemId,
          sessionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update with actual like count from server
        setLikeCounts((prev) => ({
          ...prev,
          [itemId]: result.data.likeCount,
        }));
      } else {
        // Revert optimistic update on failure
        setLikedItems(likedItems);
        setLikeCounts(likeCounts);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert optimistic update on error
      setLikedItems(likedItems);
      setLikeCounts(likeCounts);
    }
  };

  if (loading) {
    return (
      <Layout>
        <MagazineViewerSkeleton />
      </Layout>
    );
  }

  if (!magazine) {
    return (
      <Layout>
        <Card className="text-center p-12 max-w-lg mx-auto mt-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2">Magazine Not Found</h2>
          <p className="text-dark-gray mb-6">
            This magazine doesn&apos;t exist or has been unpublished.
          </p>
          <Link href="/magazines">
            <Button variant="primary">← Back to Archive</Button>
          </Link>
        </Card>
      </Layout>
    );
  }

  const sortedItems = [...magazine.items].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Layout>
      {/* Magazine Header */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-primary mb-8">
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{magazine.title}</h1>
          {magazine.description && (
            <p className="text-white/95 text-lg mb-6 max-w-2xl mx-auto">{magazine.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {magazine.publishedAt
                ? new Date(magazine.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently published'}
            </span>
            <span>•</span>
            <span>
              {sortedItems.length} {sortedItems.length === 1 ? 'story' : 'stories'} from our community
            </span>
          </div>
        </div>
      </Card>

      {/* Magazine Articles */}
      <div className="space-y-6 mb-12">
        {sortedItems.map((item, index) => {
          const submission = item.submission;
          const isExpanded = expandedItems.has(item.id);
          const isLiked = likedItems.has(item.id);
          const categoryColor = getCategoryColor(submission.category);
          const shouldTruncate = submission.textContent && submission.textContent.length > 300;

          return (
            <Card key={item.id} className="overflow-hidden" style={{ borderTop: `4px solid ${categoryColor}` }}>
              <div className="p-6">
                {/* Article Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-gray">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCategoryEmoji(submission.category)}</span>
                    <div>
                      <div className="font-bold text-lg" style={{ color: categoryColor }}>
                        {getCategoryName(submission.category)}
                      </div>
                      <div className="text-sm text-dark-gray">
                        By {submission.user?.name || submission.userName || 'Anonymous'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-background px-3 py-1 rounded-full text-xs font-semibold text-dark-gray">
                    #{index + 1}
                  </div>
                </div>

                {/* Article Content */}
                {submission.textContent && (
                  <div className="mb-4">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {shouldTruncate && !isExpanded
                        ? submission.textContent.substring(0, 300) + '...'
                        : submission.textContent}
                    </p>
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="mt-3 px-4 py-2 rounded-xl border-2 font-semibold text-sm flex items-center gap-2 transition-colors"
                        style={{
                          borderColor: categoryColor,
                          color: categoryColor,
                          backgroundColor: 'transparent',
                        }}
                      >
                        {isExpanded ? (
                          <>
                            Show Less <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Article Media */}
                {submission.mediaUrl && (
                  <div className="mb-4">
                    <Image
                      src={submission.mediaUrl}
                      alt={`Content from ${submission.user?.name || 'Anonymous'}`}
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-xl border border-light-gray"
                      unoptimized={submission.mediaUrl.startsWith('data:')}
                    />
                  </div>
                )}

                {/* Article Actions */}
                <div className="flex gap-3 pt-4 border-t border-light-gray">
                  <Button
                    variant={isLiked ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => toggleLike(item.id)}
                    icon={<Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />}
                  >
                    {isLiked ? 'Liked' : 'Like'}
                    {likeCounts[item.id] > 0 && (
                      <span className="ml-1 font-semibold">({likeCounts[item.id]})</span>
                    )}
                  </Button>

                  {submission.textContent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakText(submission.textContent!)}
                      icon={<Volume2 className="h-4 w-4" />}
                    >
                      Listen
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer CTA */}
      <Card className="text-center p-8 bg-gradient-to-br from-background to-white">
        <p className="text-xl font-semibold mb-2">Thank you for reading! 💚</p>
        <p className="text-dark-gray mb-6">Want to contribute to the next edition?</p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Share Your Story →
          </Button>
        </Link>
      </Card>
    </Layout>
  );
}
