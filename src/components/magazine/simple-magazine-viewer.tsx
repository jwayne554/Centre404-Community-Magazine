'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  category: string;
  textContent: string | null;
  mediaUrl: string | null;
  submittedAt: string;
  user: {
    name: string;
  } | null;
}

export function SimpleMagazineViewer() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedCategory]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const response = await fetch(`/api/submissions?status=APPROVED${categoryParam}`);
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'MY_NEWS':
        return { emoji: '📰', label: 'My News', color: '#2c5aa0' };
      case 'SAYING_HELLO':
        return { emoji: '👋', label: 'Saying Hello', color: '#27ae60' };
      case 'MY_SAY':
        return { emoji: '💬', label: 'My Say', color: '#8e44ad' };
      default:
        return { emoji: '📝', label: 'Story', color: '#7f8c8d' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <p>Loading stories...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Community Magazine</h2>
      
      {/* Filter Buttons - Matching original style */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          className={`tool-button ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
          style={selectedCategory === 'all' ? { 
            background: 'var(--primary-color)', 
            color: 'white',
            borderColor: 'var(--primary-color)'
          } : {}}
        >
          All Stories
        </button>
        <button
          className={`tool-button ${selectedCategory === 'MY_NEWS' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('MY_NEWS')}
          style={selectedCategory === 'MY_NEWS' ? { 
            background: 'var(--primary-color)', 
            color: 'white',
            borderColor: 'var(--primary-color)'
          } : {}}
        >
          📰 My News
        </button>
        <button
          className={`tool-button ${selectedCategory === 'SAYING_HELLO' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('SAYING_HELLO')}
          style={selectedCategory === 'SAYING_HELLO' ? { 
            background: 'var(--primary-color)', 
            color: 'white',
            borderColor: 'var(--primary-color)'
          } : {}}
        >
          👋 Saying Hello
        </button>
        <button
          className={`tool-button ${selectedCategory === 'MY_SAY' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('MY_SAY')}
          style={selectedCategory === 'MY_SAY' ? { 
            background: 'var(--primary-color)', 
            color: 'white',
            borderColor: 'var(--primary-color)'
          } : {}}
        >
          💬 My Say
        </button>
      </div>

      {/* Magazine Grid - Matching original style */}
      {submissions.length === 0 ? (
        <div style={{
          background: '#f8f9fa',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No stories in this category yet</p>
          <p style={{ color: '#666' }}>Be the first to contribute!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {submissions.map((submission) => {
            const categoryInfo = getCategoryInfo(submission.category);
            const isExpanded = expandedItem === submission.id;
            
            return (
              <div
                key={submission.id}
                className="magazine-card"
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isExpanded ? 'scale(1.02)' : 'scale(1)'
                }}
                onClick={() => setExpandedItem(isExpanded ? null : submission.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = isExpanded ? 'scale(1.02)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '15px',
                  background: categoryInfo.color,
                  color: 'white',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>{categoryInfo.emoji}</span>
                  <span>{categoryInfo.label}</span>
                </div>
                
                {/* Content */}
                <div style={{ padding: '20px' }}>
                  {submission.mediaUrl && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImage(submission.mediaUrl);
                      }}
                      style={{ cursor: 'pointer', marginBottom: '15px' }}
                    >
                      <img
                        src={submission.mediaUrl}
                        alt="Story image"
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '2px solid #e0e0e0'
                        }}
                      />
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        textAlign: 'center',
                        marginTop: '5px'
                      }}>
                        🔍 Click to view larger
                      </p>
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '10px' }}>
                    <strong>{submission.user?.name || 'Community Member'}</strong>
                  </div>
                  
                  {submission.textContent && (
                    <p style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      marginBottom: '15px',
                      maxHeight: isExpanded ? 'none' : '100px',
                      overflow: 'hidden'
                    }}>
                      {submission.textContent}
                    </p>
                  )}
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button
                      className="tool-button"
                      style={{ flex: 1, padding: '8px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Liked! ❤️');
                      }}
                    >
                      ❤️ Like
                    </button>
                    {submission.textContent && (
                      <button
                        className="tool-button"
                        style={{ flex: 1, padding: '8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(submission.textContent!);
                        }}
                      >
                        🔊 Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <div 
          onClick={() => setModalImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            padding: '20px'
          }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <img 
              src={modalImage} 
              alt="Full size image"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}
              onClick={() => setModalImage(null)}
              aria-label="Close modal"
            >
              ×
            </button>
            <p style={{
              color: 'white',
              marginTop: '15px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Click anywhere outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}