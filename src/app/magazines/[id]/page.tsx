'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Heart, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { getCategoryEmoji, getCategoryColor, getCategoryName } from '@/utils/category-helpers';
import { useMagazineData } from '@/hooks/useMagazineData';
import { useTTSPlayback } from '@/hooks/useTTSPlayback';

export default function MagazinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { magazine, isLoading: loading } = useMagazineData({
    magazineId: resolvedParams.id,
    publicOnly: true,
  });
  const { play: speakText } = useTTSPlayback();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedItems(newSet);
  };

  const toggleLike = (id: string) => {
    const newSet = new Set(likedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setLikedItems(newSet);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>📖</div>
          <p style={{ color: '#666' }}>Loading magazine...</p>
        </div>
      </div>
    );
  }

  if (!magazine) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📚</div>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Magazine Not Found</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>This magazine doesn&apos;t exist or has been unpublished.</p>
          <Link
            href="/magazines"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--primary-color)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600'
            }}
          >
            ← Back to Archive
          </Link>
        </div>
      </div>
    );
  }

  const sortedItems = [...magazine.items].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Magazine Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color), var(--success-color))',
          color: 'white',
          padding: '40px 30px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📖</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '15px', color: 'white' }}>
            {magazine.title}
          </h1>
          {magazine.description && (
            <p style={{ fontSize: '18px', marginBottom: '20px', opacity: 0.95 }}>
              {magazine.description}
            </p>
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            fontSize: '14px',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar className="h-4 w-4" />
              {magazine.publishedAt ? new Date(magazine.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : 'Recently published'}
            </span>
            <span>•</span>
            <span>{sortedItems.length} {sortedItems.length === 1 ? 'story' : 'stories'} from our community</span>
          </div>
        </div>

        {/* Back Button */}
        <Link
          href="/magazines"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#f8f9fa',
            border: '2px solid #ddd',
            borderRadius: '6px',
            textDecoration: 'none',
            color: 'var(--text-color)',
            marginBottom: '30px',
            fontWeight: '600'
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Archive
        </Link>

        {/* Magazine Content */}
        <div style={{ marginBottom: '40px' }}>
          {sortedItems.map((item, index) => {
            const submission = item.submission;
            const isExpanded = expandedItems.has(item.id);
            const isLiked = likedItems.has(item.id);
            const categoryColor = getCategoryColor(submission.category);
            const shouldTruncate = submission.textContent && submission.textContent.length > 300;

            return (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  padding: '25px',
                  marginBottom: '20px',
                  borderTop: `4px solid ${categoryColor}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>
                      {getCategoryEmoji(submission.category)}
                    </span>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: categoryColor,
                        marginBottom: '4px'
                      }}>
                        {getCategoryName(submission.category)}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        By {submission.user?.name || submission.userName || 'Anonymous'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>
                    #{index + 1}
                  </div>
                </div>

                {/* Content */}
                {submission.textContent && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: 'var(--text-color)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {shouldTruncate && !isExpanded
                        ? submission.textContent.substring(0, 300) + '...'
                        : submission.textContent}
                    </p>
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          background: 'transparent',
                          border: `2px solid ${categoryColor}`,
                          borderRadius: '6px',
                          color: categoryColor,
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
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

                {/* Media */}
                {submission.mediaUrl && (
                  <div style={{ marginBottom: '15px' }}>
                    <img
                      src={submission.mediaUrl}
                      alt={`Content from ${submission.user?.name || 'Anonymous'}`}
                      style={{
                        maxWidth: '100%',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  paddingTop: '15px',
                  borderTop: '1px solid #eee'
                }}>
                  <button
                    onClick={() => toggleLike(item.id)}
                    style={{
                      padding: '8px 16px',
                      background: isLiked ? 'var(--danger-color)' : '#f8f9fa',
                      border: `2px solid ${isLiked ? 'var(--danger-color)' : '#ddd'}`,
                      borderRadius: '6px',
                      color: isLiked ? 'white' : 'var(--text-color)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Heart className="h-4 w-4" fill={isLiked ? 'white' : 'none'} />
                    {isLiked ? 'Liked' : 'Like'}
                  </button>

                  {submission.textContent && (
                    <button
                      onClick={() => speakText(submission.textContent!)}
                      style={{
                        padding: '8px 16px',
                        background: '#f8f9fa',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Volume2 className="h-4 w-4" />
                      Listen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '30px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
            Thank you for reading! 💚
          </p>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Want to contribute to the next edition?
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--primary-color)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600'
            }}
          >
            Share Your Story →
          </Link>
        </div>
      </div>
    </div>
  );
}
