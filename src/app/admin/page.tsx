'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  category: string;
  contentType: string;
  textContent: string | null;
  mediaUrl: string | null;
  drawingData: string | null;
  status: string;
  submittedAt: string;
  user: {
    id: string;
    name: string;
  } | null;
}

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  items: {
    id: string;
  }[];
}

export default function AdminDashboard() {
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [draftMagazines, setDraftMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [magazinesLoading, setMagazinesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Win 5: Memoize filtered submissions to prevent recalculation on every render
  const submissions = useMemo(() => {
    if (activeTab === 'ALL') return allSubmissions;
    return allSubmissions.filter(s => s.status === activeTab);
  }, [activeTab, allSubmissions]);

  useEffect(() => {
    fetchAllSubmissions();
    fetchDraftMagazines();
  }, []);

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();
      setAllSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDraftMagazines = async () => {
    setMagazinesLoading(true);
    try {
      const response = await fetch('/api/magazines');
      const data = await response.json();
      const drafts = data.filter((m: Magazine) => m.status === 'DRAFT');
      setDraftMagazines(drafts);
    } catch (error) {
      console.error('Failed to fetch draft magazines:', error);
    } finally {
      setMagazinesLoading(false);
    }
  };

  const publishDraft = async (id: string) => {
    if (!confirm('Publish this magazine? It will be visible to all users.')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await fetchDraftMagazines();
        alert('Magazine published successfully!');
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to publish: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to publish magazine:', error);
      alert('Failed to publish magazine. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm('Delete this draft? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDraftMagazines();
        alert('Draft deleted successfully');
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to delete: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete draft:', error);
      alert('Failed to delete draft. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/submissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchAllSubmissions();
        setSelectedSubmission(null);
        setSelectedIds(new Set());
      } else {
        // Handle non-OK responses
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to update submission:', errorData);
        alert(`Failed to update submission: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to update submission:', error);
      alert('Failed to update submission. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const bulkApprove = async () => {
    if (selectedIds.size === 0) return;

    setActionLoading(true);
    const promises = Array.from(selectedIds).map(id =>
      updateSubmissionStatus(id, 'APPROVED')
    );

    try {
      await Promise.all(promises);
      setSelectedIds(new Set());
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === submissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map(s => s.id)));
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { background: '#fff3cd', color: '#856404', border: '2px solid #ffc107' };
      case 'APPROVED':
        return { background: '#d4edda', color: '#155724', border: '2px solid #27ae60' };
      case 'REJECTED':
        return { background: '#f8d7da', color: '#721c24', border: '2px solid #e74c3c' };
      default:
        return { background: '#f8f9fa', color: '#666', border: '2px solid #ddd' };
    }
  };

  // Quick Win 5: Memoize stats calculation to prevent recalculation on every render
  const stats = useMemo(() => ({
    total: allSubmissions.length,
    pending: allSubmissions.filter(s => s.status === 'PENDING').length,
    approved: allSubmissions.filter(s => s.status === 'APPROVED').length,
    rejected: allSubmissions.filter(s => s.status === 'REJECTED').length,
  }), [allSubmissions]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #27ae60, #2c5aa0)',
          color: 'white',
          padding: '40px 30px',
          borderRadius: '12px',
          marginBottom: '30px',
          position: 'relative'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px', color: 'white' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '25px' }}>
            Review submissions, manage content, and compile magazine editions
          </p>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🏠 Home
            </Link>
            <Link
              href="/magazines"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📚 Archive
            </Link>
            <Link
              href="/admin/compile"
              className="btn-large"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#f39c12',
                border: '2px solid #f39c12',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s',
                minHeight: 'auto'
              }}
            >
              📖 Compile Magazine →
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Total Card */}
          <div
            onClick={() => setActiveTab('ALL')}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: 'var(--shadow)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: activeTab === 'ALL' ? '3px solid #2c5aa0' : '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
          >
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
              📊 ALL SUBMISSIONS
            </div>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#2c5aa0' }}>
              {stats.total}
            </div>
          </div>

          {/* Pending Card */}
          <div
            onClick={() => setActiveTab('PENDING')}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: 'var(--shadow)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: activeTab === 'PENDING' ? '3px solid #f39c12' : '3px solid transparent',
              borderLeft: '6px solid #f39c12'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
          >
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
              ⏳ PENDING REVIEW
            </div>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#f39c12' }}>
              {stats.pending}
            </div>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>
              Needs attention
            </div>
          </div>

          {/* Approved Card */}
          <div
            onClick={() => setActiveTab('APPROVED')}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: 'var(--shadow)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: activeTab === 'APPROVED' ? '3px solid #27ae60' : '3px solid transparent',
              borderLeft: '6px solid #27ae60'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
          >
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
              ✅ APPROVED
            </div>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#27ae60' }}>
              {stats.approved}
            </div>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>
              Ready for magazine
            </div>
          </div>

          {/* Rejected Card */}
          <div
            onClick={() => setActiveTab('REJECTED')}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: 'var(--shadow)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: activeTab === 'REJECTED' ? '3px solid #e74c3c' : '3px solid transparent',
              borderLeft: '6px solid #e74c3c'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
          >
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
              ❌ REJECTED
            </div>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#e74c3c' }}>
              {stats.rejected}
            </div>
          </div>
        </div>

        {/* Draft Magazines Section */}
        {draftMagazines.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: 'var(--shadow)',
            border: '3px solid #f39c12'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                📝 Draft Magazines ({draftMagazines.length})
              </h2>
              <p style={{ color: '#666', fontSize: '15px' }}>
                Magazines saved as drafts - publish them to make them visible to users
              </p>
            </div>

            {magazinesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                <p style={{ color: '#666' }}>Loading drafts...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {draftMagazines.map((magazine) => (
                  <div
                    key={magazine.id}
                    style={{
                      border: '2px solid #f39c12',
                      borderRadius: '8px',
                      padding: '20px',
                      background: '#fffbf5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '20px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '5px' }}>
                        📖 {magazine.title}
                      </div>
                      {magazine.description && (
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                          {magazine.description}
                        </p>
                      )}
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        {magazine.items.length} submission{magazine.items.length !== 1 ? 's' : ''} •{' '}
                        Created {new Date(magazine.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => publishDraft(magazine.id)}
                        disabled={actionLoading}
                        style={{
                          padding: '10px 20px',
                          background: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          opacity: actionLoading ? 0.5 : 1,
                          transition: 'all 0.3s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => !actionLoading && (e.currentTarget.style.background = '#229954')}
                        onMouseLeave={(e) => !actionLoading && (e.currentTarget.style.background = '#27ae60')}
                      >
                        🌐 Publish Now
                      </button>
                      <button
                        onClick={() => deleteDraft(magazine.id)}
                        disabled={actionLoading}
                        style={{
                          padding: '10px 20px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          opacity: actionLoading ? 0.5 : 1,
                          transition: 'all 0.3s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => !actionLoading && (e.currentTarget.style.background = '#c0392b')}
                        onMouseLeave={(e) => !actionLoading && (e.currentTarget.style.background = '#e74c3c')}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {submissions.length > 0 && activeTab === 'PENDING' && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 15px',
                background: '#f8f9fa',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === submissions.length && submissions.length > 0}
                  onChange={selectAll}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </label>
            )}

            {selectedIds.size > 0 && activeTab === 'PENDING' && (
              <button
                onClick={bulkApprove}
                disabled={actionLoading}
                className="btn-large"
                style={{
                  background: '#27ae60',
                  color: 'white',
                  padding: '8px 20px',
                  minHeight: 'auto',
                  opacity: actionLoading ? 0.5 : 1,
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                ✅ Approve Selected ({selectedIds.size})
              </button>
            )}
          </div>

          <button
            onClick={fetchAllSubmissions}
            className="tool-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Submissions List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              {activeTab === 'ALL' && '📋 All Submissions'}
              {activeTab === 'PENDING' && '⏳ Pending Review'}
              {activeTab === 'APPROVED' && '✅ Approved Submissions'}
              {activeTab === 'REJECTED' && '❌ Rejected Submissions'}
            </h2>
            <p style={{ color: '#666', fontSize: '15px' }}>
              {activeTab === 'PENDING' && 'Review these submissions to approve or reject them'}
              {activeTab === 'APPROVED' && 'These submissions are ready to be compiled into magazines'}
              {activeTab === 'REJECTED' && 'These submissions were not approved'}
              {activeTab === 'ALL' && 'View all submissions across all statuses'}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px', animation: 'spin 2s linear infinite' }}>
                🔄
              </div>
              <p style={{ color: '#666', fontSize: '16px' }}>Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>📭</div>
              <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                No submissions found
              </p>
              {activeTab === 'PENDING' && (
                <p style={{ color: '#666' }}>All caught up! No pending reviews.</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {submissions.map((submission) => {
                const categoryColor = getCategoryColor(submission.category);
                const statusBadgeStyle = getStatusBadgeStyle(submission.status);

                return (
                  <div
                    key={submission.id}
                    style={{
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      transition: 'all 0.3s',
                      borderLeft: `6px solid ${categoryColor}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                      {/* Checkbox */}
                      {activeTab === 'PENDING' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(submission.id)}
                          onChange={() => toggleSelection(submission.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '5px' }}
                        />
                      )}

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '12px',
                          gap: '15px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '32px' }}>
                              {getCategoryEmoji(submission.category)}
                            </span>
                            <div>
                              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                                {submission.category.replace(/_/g, ' ')}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                By {submission.user?.name || 'Anonymous'} •{' '}
                                {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>

                          <span style={{
                            ...statusBadgeStyle,
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '700',
                            whiteSpace: 'nowrap'
                          }}>
                            {submission.status}
                          </span>
                        </div>

                        {/* Text Preview */}
                        {submission.textContent && (
                          <p style={{
                            fontSize: '15px',
                            lineHeight: '1.6',
                            color: '#555',
                            marginBottom: '10px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {submission.textContent}
                          </p>
                        )}

                        {/* Media Preview (Image/Drawing/Audio) */}
                        {(submission.mediaUrl || submission.drawingData) && (
                          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                            {submission.contentType === 'AUDIO' || submission.mediaUrl?.match(/\.(mp3|wav|webm|ogg|m4a)$/i) ? (
                              <>
                                <audio
                                  controls
                                  src={submission.mediaUrl || ''}
                                  style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <div style={{
                                  display: 'inline-block',
                                  background: '#e3f2fd',
                                  color: '#1565c0',
                                  padding: '4px 12px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  marginTop: '8px'
                                }}>
                                  🎵 Audio Recording
                                </div>
                              </>
                            ) : (
                              <>
                                <img
                                  src={submission.mediaUrl || submission.drawingData || ''}
                                  alt="Preview"
                                  style={{
                                    maxWidth: '200px',
                                    maxHeight: '150px',
                                    borderRadius: '6px',
                                    border: '2px solid #ddd',
                                    objectFit: 'cover',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                />
                                {submission.drawingData && (
                                  <div style={{
                                    display: 'inline-block',
                                    background: '#f3e5f5',
                                    color: '#7b1fa2',
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    marginTop: '8px'
                                  }}>
                                    🎨 Drawing
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="tool-button"
                            style={{ fontSize: '14px' }}
                          >
                            👁️ View Full
                          </button>

                          {submission.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateSubmissionStatus(submission.id, 'APPROVED')}
                                disabled={actionLoading}
                                style={{
                                  padding: '8px 16px',
                                  background: '#27ae60',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  fontWeight: '600',
                                  fontSize: '14px',
                                  opacity: actionLoading ? 0.5 : 1,
                                  transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => !actionLoading && (e.currentTarget.style.background = '#229954')}
                                onMouseLeave={(e) => !actionLoading && (e.currentTarget.style.background = '#27ae60')}
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => updateSubmissionStatus(submission.id, 'REJECTED')}
                                disabled={actionLoading}
                                style={{
                                  padding: '8px 16px',
                                  background: '#e74c3c',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  fontWeight: '600',
                                  fontSize: '14px',
                                  opacity: actionLoading ? 0.5 : 1,
                                  transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => !actionLoading && (e.currentTarget.style.background = '#c0392b')}
                                onMouseLeave={(e) => !actionLoading && (e.currentTarget.style.background = '#e74c3c')}
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedSubmission && (
          <div
            onClick={() => setSelectedSubmission(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
              cursor: 'pointer'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                cursor: 'default'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '30px',
                borderBottom: '2px solid #eee',
                background: getCategoryColor(selectedSubmission.category),
                color: 'white',
                borderRadius: '12px 12px 0 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                      {getCategoryEmoji(selectedSubmission.category)}
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>
                      Review Submission
                    </h2>
                    <p style={{ fontSize: '15px', opacity: 0.95 }}>
                      Submitted by {selectedSubmission.user?.name || 'Anonymous'} on{' '}
                      {new Date(selectedSubmission.submittedAt).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <span style={{
                    ...getStatusBadgeStyle(selectedSubmission.status),
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '30px' }}>
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '14px', color: '#999', fontWeight: '700', marginBottom: '8px', letterSpacing: '1px' }}>
                    CATEGORY
                  </h3>
                  <p style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedSubmission.category.replace(/_/g, ' ')}
                  </p>
                </div>

                {selectedSubmission.textContent && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '14px', color: '#999', fontWeight: '700', marginBottom: '12px', letterSpacing: '1px' }}>
                      CONTENT
                    </h3>
                    <p style={{
                      fontSize: '17px',
                      lineHeight: '1.8',
                      color: '#2c3e50',
                      whiteSpace: 'pre-wrap',
                      background: '#f8f9fa',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}>
                      {selectedSubmission.textContent}
                    </p>
                  </div>
                )}

                {selectedSubmission.mediaUrl && (
                  <div style={{ marginBottom: '25px' }}>
                    {selectedSubmission.contentType === 'AUDIO' || selectedSubmission.mediaUrl?.match(/\.(mp3|wav|webm|ogg|m4a)$/i) ? (
                      <>
                        <h3 style={{ fontSize: '14px', color: '#999', fontWeight: '700', marginBottom: '12px', letterSpacing: '1px' }}>
                          🎵 AUDIO RECORDING
                        </h3>
                        <audio
                          controls
                          src={selectedSubmission.mediaUrl}
                          style={{
                            width: '100%',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <h3 style={{ fontSize: '14px', color: '#999', fontWeight: '700', marginBottom: '12px', letterSpacing: '1px' }}>
                          {selectedSubmission.drawingData ? '🎨 DRAWING' : '📷 IMAGE ATTACHMENT'}
                        </h3>
                        <img
                          src={selectedSubmission.mediaUrl}
                          alt="Submission media"
                          style={{
                            maxWidth: '100%',
                            borderRadius: '8px',
                            border: '2px solid #ddd',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </>
                    )}
                  </div>
                )}

                {selectedSubmission.drawingData && !selectedSubmission.mediaUrl && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '14px', color: '#999', fontWeight: '700', marginBottom: '12px', letterSpacing: '1px' }}>
                      🎨 DRAWING
                    </h3>
                    <img
                      src={selectedSubmission.drawingData}
                      alt="User drawing"
                      style={{
                        maxWidth: '100%',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        background: 'white'
                      }}
                    />
                  </div>
                )}

                {/* Modal Actions */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  paddingTop: '25px',
                  borderTop: '2px solid #eee',
                  flexWrap: 'wrap'
                }}>
                  {selectedSubmission.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'APPROVED')}
                        disabled={actionLoading}
                        className="btn-large"
                        style={{
                          flex: 1,
                          background: '#27ae60',
                          color: 'white',
                          opacity: actionLoading ? 0.5 : 1,
                          cursor: actionLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ✅ Approve Submission
                      </button>
                      <button
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'REJECTED')}
                        disabled={actionLoading}
                        className="btn-large"
                        style={{
                          flex: 1,
                          background: '#e74c3c',
                          color: 'white',
                          opacity: actionLoading ? 0.5 : 1,
                          cursor: actionLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ❌ Reject Submission
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="btn-large"
                    style={{
                      flex: selectedSubmission.status === 'PENDING' ? 'none' : 1,
                      background: '#f8f9fa',
                      color: '#2c3e50',
                      border: '2px solid #ddd'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
