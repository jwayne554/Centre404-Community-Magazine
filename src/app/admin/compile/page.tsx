'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Submission {
  id: string;
  category: string;
  contentType: string;
  textContent: string | null;
  mediaUrl: string | null;
  status: string;
  submittedAt: string;
  userName: string | null;
  user: {
    id: string;
    name: string;
  } | null;
}

export default function MagazineCompiler() {
  const router = useRouter();
  const [approvedSubmissions, setApprovedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Magazine metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publishNow, setPublishNow] = useState(false);

  useEffect(() => {
    fetchApprovedSubmissions();
  }, []);

  const fetchApprovedSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/submissions?status=APPROVED');
      const data = await response.json();
      setApprovedSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToMagazine = (submission: Submission) => {
    if (!selectedSubmissions.find(s => s.id === submission.id)) {
      setSelectedSubmissions([...selectedSubmissions, submission]);
    }
  };

  const removeFromMagazine = (id: string) => {
    setSelectedSubmissions(selectedSubmissions.filter(s => s.id !== id));
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...selectedSubmissions];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setSelectedSubmissions(newOrder);
    }
  };

  const moveDown = (index: number) => {
    if (index < selectedSubmissions.length - 1) {
      const newOrder = [...selectedSubmissions];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setSelectedSubmissions(newOrder);
    }
  };

  const saveMagazine = async () => {
    if (!title.trim()) {
      alert('Please add a magazine title');
      return;
    }

    if (selectedSubmissions.length === 0) {
      alert('Please add at least one submission to the magazine');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/magazines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          submissionIds: selectedSubmissions.map(s => s.id),
          isPublic: publishNow,
        }),
      });

      if (response.ok) {
        alert(`Magazine ${publishNow ? 'published' : 'saved as draft'} successfully!`);
        router.push('/magazines');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create magazine');
      }
    } catch (error) {
      console.error('Failed to create magazine:', error);
      alert(`Failed to create magazine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'MY_NEWS': return '📰';
      case 'SAYING_HELLO': return '👋';
      case 'MY_SAY': return '💬';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MY_NEWS': return '#f39c12';
      case 'SAYING_HELLO': return '#27ae60';
      case 'MY_SAY': return '#9b59b6';
      default: return '#3498db';
    }
  };

  const generateSuggestedTitle = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    setTitle(`${month} ${year} Edition`);
    setDescription(`Our community stories and updates from ${month} ${year}`);
  };

  const availableSubmissions = approvedSubmissions.filter(
    as => !selectedSubmissions.find(ss => ss.id === as.id)
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f39c12, #e67e22)',
          color: 'white',
          padding: '40px 30px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '20px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ← Back to Dashboard
          </Link>

          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📖</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px', color: 'white' }}>
            Compile Magazine Edition
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.95 }}>
            Select and arrange approved submissions to create a beautiful magazine
          </p>
        </div>

        {/* Magazine Information */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '25px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ✨ Magazine Information
            </h2>
            <p style={{ color: '#666', fontSize: '15px' }}>
              Give your magazine a title and description
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Spring 2025 Edition, Issue #5"
                  maxLength={255}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <button
                onClick={generateSuggestedTitle}
                className="tool-button"
                style={{
                  alignSelf: 'flex-end',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ✨ Suggest Title
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this edition"
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  minHeight: '90px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px',
              background: '#e3f2fd',
              border: '2px solid #2196f3',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              🌐 Publish immediately (make visible to all users)
            </label>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '25px',
          marginBottom: '25px'
        }}>
          {/* Available Submissions */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #eee' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '5px' }}>
                📚 Available Submissions ({availableSubmissions.length})
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Approved submissions ready to be added
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
                <p style={{ color: '#666', fontSize: '16px' }}>Loading submissions...</p>
              </div>
            ) : availableSubmissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '64px', marginBottom: '15px' }}>✅</div>
                <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {selectedSubmissions.length > 0 ? 'All Added!' : 'No Submissions'}
                </p>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  {selectedSubmissions.length > 0
                    ? 'All approved submissions have been added!'
                    : 'No approved submissions yet.'}
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: '650px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {availableSubmissions.map((submission) => {
                  const categoryColor = getCategoryColor(submission.category);

                  return (
                    <div
                      key={submission.id}
                      style={{
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        borderLeft: `5px solid ${categoryColor}`,
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8f9fa';
                        e.currentTarget.style.transform = 'translateX(3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '28px' }}>
                          {getCategoryEmoji(submission.category)}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '3px' }}>
                            {submission.category.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            By {submission.user?.name || submission.userName || 'Anonymous'}
                          </div>
                        </div>
                        <button
                          onClick={() => addToMagazine(submission)}
                          style={{
                            padding: '6px 14px',
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#229954')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#27ae60')}
                        >
                          + Add
                        </button>
                      </div>
                      {submission.textContent && (
                        <p style={{
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#555',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {submission.textContent}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected for Magazine */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: 'var(--shadow)',
            border: '3px solid #f39c12',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #eee' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '5px' }}>
                📖 Selected for Edition ({selectedSubmissions.length})
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Arrange these in the order they&apos;ll appear
              </p>
            </div>

            {selectedSubmissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '64px', marginBottom: '15px' }}>📭</div>
                <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No Submissions Selected
                </p>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Click &quot;Add&quot; on submissions from the left to include them
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: '650px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedSubmissions.map((submission, index) => {
                  const categoryColor = getCategoryColor(submission.category);

                  return (
                    <div
                      key={submission.id}
                      style={{
                        border: '2px solid #f39c12',
                        borderRadius: '8px',
                        padding: '15px',
                        background: '#fffbf5',
                        borderLeft: `5px solid ${categoryColor}`
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {/* Reorder Controls */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: index === 0 ? '#e0e0e0' : '#f8f9fa',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              opacity: index === 0 ? 0.4 : 1
                            }}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === selectedSubmissions.length - 1}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: index === selectedSubmissions.length - 1 ? '#e0e0e0' : '#f8f9fa',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              cursor: index === selectedSubmissions.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              opacity: index === selectedSubmissions.length - 1 ? 0.4 : 1
                            }}
                          >
                            ↓
                          </button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '24px' }}>
                              {getCategoryEmoji(submission.category)}
                            </span>
                            <span style={{
                              background: categoryColor,
                              color: 'white',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}>
                              #{index + 1}
                            </span>
                            <div style={{ fontSize: '15px', fontWeight: '700' }}>
                              {submission.category.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            By {submission.user?.name || submission.userName || 'Anonymous'}
                          </div>
                          {submission.textContent && (
                            <p style={{
                              fontSize: '13px',
                              lineHeight: '1.5',
                              color: '#555',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {submission.textContent}
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromMagazine(submission.id)}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#fee',
                            border: '2px solid #e74c3c',
                            borderRadius: '6px',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e74c3c';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fee';
                            e.currentTarget.style.color = '#e74c3c';
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e8e9ea)',
          borderRadius: '12px',
          padding: '25px 30px',
          border: '3px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '5px' }}>
              Ready to {publishNow ? 'Publish' : 'Save'}? 🚀
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} selected
              {publishNow && ' • Will be visible to all users immediately'}
              {!publishNow && ' • Can be published later from the archive'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/admin')}
              disabled={saving}
              className="tool-button"
              style={{
                opacity: saving ? 0.5 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveMagazine}
              disabled={saving || !title.trim() || selectedSubmissions.length === 0}
              className="btn-large"
              style={{
                background: publishNow ? '#27ae60' : '#2c5aa0',
                color: 'white',
                opacity: (saving || !title.trim() || selectedSubmissions.length === 0) ? 0.5 : 1,
                cursor: (saving || !title.trim() || selectedSubmissions.length === 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving ? (
                <>
                  ⏳ {publishNow ? 'Publishing...' : 'Saving...'}
                </>
              ) : publishNow ? (
                <>
                  🌐 Publish Magazine
                </>
              ) : (
                <>
                  💾 Save as Draft
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
