'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubmissionSkeletonGrid } from '@/components/skeletons/submission-skeleton';
import { getCategoryEmoji, getCategoryColor } from '@/utils/category-helpers';
import Layout from '@/components/ui/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  LogOut,
  Home,
  BookOpen,
  FileEdit,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  Trash2,
  Globe,
} from 'lucide-react';

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
  const router = useRouter();
  const { user, logout } = useAuth();

  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [draftMagazines, setDraftMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [magazinesLoading, setMagazinesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // Memoize filtered submissions to prevent recalculation on every render
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
      const response = await fetch('/api/submissions', {
        credentials: 'include',
      });
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
      const response = await fetch('/api/magazines', {
        credentials: 'include',
      });
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
        credentials: 'include',
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
        credentials: 'include',
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

    const previousSubmissions = allSubmissions;
    const previousSelectedSubmission = selectedSubmission;

    setAllSubmissions(prev =>
      prev.map(s => s.id === id ? { ...s, status } : s)
    );

    if (selectedSubmission?.id === id) {
      setSelectedSubmission({ ...selectedSubmission, status });
    }

    try {
      const response = await fetch(`/api/submissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchAllSubmissions();
        setSelectedSubmission(null);
        setSelectedIds(new Set());
      } else {
        setAllSubmissions(previousSubmissions);
        setSelectedSubmission(previousSelectedSubmission);

        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to update submission:', errorData);
        alert(`Failed to update submission: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setAllSubmissions(previousSubmissions);
      setSelectedSubmission(previousSelectedSubmission);

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-accent/20 text-accent border-accent';
      case 'APPROVED':
        return 'bg-primary/20 text-primary border-primary';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-background text-dark-gray border-light-gray';
    }
  };

  const stats = useMemo(() => ({
    total: allSubmissions.length,
    pending: allSubmissions.filter(s => s.status === 'PENDING').length,
    approved: allSubmissions.filter(s => s.status === 'APPROVED').length,
    rejected: allSubmissions.filter(s => s.status === 'REJECTED').length,
  }), [allSubmissions]);

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Layout>
        {/* Hero Header */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-primary mb-8">
          <div className="p-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/95 mb-6">
              Review submissions, manage content, and compile magazine editions
            </p>

            {/* User Info & Logout */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-6 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Welcome, {user?.name}</span>
                <span className="bg-white/25 px-3 py-1 rounded-full text-sm font-medium">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (confirm('Are you sure you want to logout?')) {
                    await logout();
                    router.push('/login');
                  }
                }}
                icon={<LogOut className="h-4 w-4" />}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/">
                <Button
                  variant="outline"
                  icon={<Home className="h-4 w-4" />}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                >
                  Home
                </Button>
              </Link>
              <Link href="/magazines">
                <Button
                  variant="outline"
                  icon={<BookOpen className="h-4 w-4" />}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                >
                  Archive
                </Button>
              </Link>
              <Link href="/admin/compile">
                <Button
                  variant="secondary"
                  icon={<FileEdit className="h-4 w-4" />}
                >
                  Compile Magazine →
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Card */}
          <Card
            onClick={() => setActiveTab('ALL')}
            active={activeTab === 'ALL'}
            className="p-6 cursor-pointer transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-dark-gray mb-1">ALL SUBMISSIONS</div>
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
              </div>
            </div>
          </Card>

          {/* Pending Card */}
          <Card
            onClick={() => setActiveTab('PENDING')}
            active={activeTab === 'PENDING'}
            className="p-6 cursor-pointer transition-all hover:shadow-lg border-l-4"
            style={{ borderLeftColor: '#FFBB00' }}
          >
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-sm font-semibold text-dark-gray mb-1">PENDING REVIEW</div>
                <div className="text-3xl font-bold text-accent">{stats.pending}</div>
                <div className="text-xs text-dark-gray mt-1">Needs attention</div>
              </div>
            </div>
          </Card>

          {/* Approved Card */}
          <Card
            onClick={() => setActiveTab('APPROVED')}
            active={activeTab === 'APPROVED'}
            className="p-6 cursor-pointer transition-all hover:shadow-lg border-l-4"
            style={{ borderLeftColor: '#34A853' }}
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-dark-gray mb-1">APPROVED</div>
                <div className="text-3xl font-bold text-primary">{stats.approved}</div>
                <div className="text-xs text-dark-gray mt-1">Ready for magazine</div>
              </div>
            </div>
          </Card>

          {/* Rejected Card */}
          <Card
            onClick={() => setActiveTab('REJECTED')}
            active={activeTab === 'REJECTED'}
            className="p-6 cursor-pointer transition-all hover:shadow-lg border-l-4 border-l-red-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-dark-gray mb-1">REJECTED</div>
                <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Draft Magazines Section */}
        {draftMagazines.length > 0 && (
          <Card className="mb-8 border-2 border-accent">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  📝 Draft Magazines ({draftMagazines.length})
                </h2>
                <p className="text-dark-gray">
                  Magazines saved as drafts - publish them to make them visible to users
                </p>
              </div>

              {magazinesLoading ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">⏳</div>
                  <p className="text-dark-gray">Loading drafts...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {draftMagazines.map((magazine) => (
                    <Card key={magazine.id} className="bg-accent/5 border-accent/30">
                      <div className="p-5 flex justify-between items-center gap-5 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="text-lg font-bold mb-1">
                            📖 {magazine.title}
                          </div>
                          {magazine.description && (
                            <p className="text-dark-gray text-sm mb-2">
                              {magazine.description}
                            </p>
                          )}
                          <div className="text-xs text-dark-gray">
                            {magazine.items.length} submission{magazine.items.length !== 1 ? 's' : ''} •{' '}
                            Created {new Date(magazine.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          <Button
                            variant="primary"
                            onClick={() => publishDraft(magazine.id)}
                            disabled={actionLoading}
                            icon={<Globe className="h-4 w-4" />}
                            size="sm"
                          >
                            Publish Now
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => deleteDraft(magazine.id)}
                            disabled={actionLoading}
                            icon={<Trash2 className="h-4 w-4" />}
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Action Bar */}
        <Card className="mb-6">
          <div className="p-5 flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3 flex-wrap items-center">
              {submissions.length > 0 && activeTab === 'PENDING' && (
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-background rounded-xl font-semibold">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === submissions.length && submissions.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                </label>
              )}

              {selectedIds.size > 0 && activeTab === 'PENDING' && (
                <Button
                  variant="primary"
                  onClick={bulkApprove}
                  disabled={actionLoading}
                  icon={<Check className="h-4 w-4" />}
                  size="sm"
                >
                  Approve Selected ({selectedIds.size})
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={fetchAllSubmissions}
              icon={<RefreshCw className="h-4 w-4" />}
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </Card>

        {/* Submissions List */}
        <Card>
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {activeTab === 'ALL' && '📋 All Submissions'}
                {activeTab === 'PENDING' && '⏳ Pending Review'}
                {activeTab === 'APPROVED' && '✅ Approved Submissions'}
                {activeTab === 'REJECTED' && '❌ Rejected Submissions'}
              </h2>
              <p className="text-dark-gray">
                {activeTab === 'PENDING' && 'Review these submissions to approve or reject them'}
                {activeTab === 'APPROVED' && 'These submissions are ready to be compiled into magazines'}
                {activeTab === 'REJECTED' && 'These submissions were not approved'}
                {activeTab === 'ALL' && 'View all submissions across all statuses'}
              </p>
            </div>

            {loading ? (
              <SubmissionSkeletonGrid count={5} />
            ) : submissions.length === 0 ? (
              <div className="text-center py-16 bg-background rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl font-semibold mb-2">No submissions found</p>
                {activeTab === 'PENDING' && (
                  <p className="text-dark-gray">All caught up! No pending reviews.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const categoryColor = getCategoryColor(submission.category);
                  const statusBadgeClass = getStatusBadgeClass(submission.status);

                  return (
                    <Card
                      key={submission.id}
                      className="hover:bg-background transition-colors"
                      style={{ borderLeft: `6px solid ${categoryColor}` }}
                    >
                      <div className="p-5">
                        <div className="flex gap-5 items-start">
                          {/* Checkbox */}
                          {activeTab === 'PENDING' && (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(submission.id)}
                              onChange={() => toggleSelection(submission.id)}
                              className="w-5 h-5 cursor-pointer mt-1"
                            />
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex justify-between items-start gap-4 mb-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">
                                  {getCategoryEmoji(submission.category)}
                                </span>
                                <div>
                                  <div className="text-lg font-bold mb-1">
                                    {submission.category.replace(/_/g, ' ')}
                                  </div>
                                  <div className="text-sm text-dark-gray">
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

                              <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${statusBadgeClass}`}>
                                {submission.status}
                              </span>
                            </div>

                            {/* Text Preview */}
                            {submission.textContent && (
                              <p className="text-sm leading-relaxed text-dark-gray mb-3 line-clamp-2">
                                {submission.textContent}
                              </p>
                            )}

                            {/* Media Preview */}
                            {(submission.mediaUrl || submission.drawingData) && (
                              <div className="mb-3">
                                {submission.contentType === 'AUDIO' || submission.mediaUrl?.match(/\.(mp3|wav|webm|ogg|m4a)$/i) ? (
                                  <>
                                    <audio
                                      controls
                                      src={submission.mediaUrl || ''}
                                      className="w-full max-w-md rounded-xl shadow-sm"
                                    />
                                    <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold mt-2">
                                      🎵 Audio Recording
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Image
                                      src={submission.mediaUrl || submission.drawingData || ''}
                                      alt="Preview"
                                      width={200}
                                      height={150}
                                      className="rounded-xl border-2 border-light-gray shadow-sm"
                                      style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                                      unoptimized={(submission.mediaUrl || submission.drawingData || '').startsWith('data:')}
                                    />
                                    {submission.drawingData && (
                                      <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold mt-2">
                                        🎨 Drawing
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 flex-wrap mt-4">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedSubmission(submission)}
                                icon={<Eye className="h-4 w-4" />}
                                size="sm"
                              >
                                View Full
                              </Button>

                              {submission.status === 'PENDING' && (
                                <>
                                  <Button
                                    variant="primary"
                                    onClick={() => updateSubmissionStatus(submission.id, 'APPROVED')}
                                    disabled={actionLoading}
                                    icon={<Check className="h-4 w-4" />}
                                    size="sm"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => updateSubmissionStatus(submission.id, 'REJECTED')}
                                    disabled={actionLoading}
                                    icon={<X className="h-4 w-4" />}
                                    size="sm"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Review Modal */}
        {selectedSubmission && (
          <div
            onClick={() => setSelectedSubmission(null)}
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-5 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl cursor-default"
            >
              {/* Modal Header */}
              <div
                className="p-8 rounded-t-xl text-white"
                style={{ background: getCategoryColor(selectedSubmission.category) }}
              >
                <div className="flex justify-between items-start gap-5">
                  <div>
                    <div className="text-5xl mb-3">
                      {getCategoryEmoji(selectedSubmission.category)}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Review Submission</h2>
                    <p className="text-white/95">
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

                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusBadgeClass(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-dark-gray mb-2 tracking-wider">CATEGORY</h3>
                  <p className="text-xl font-semibold">
                    {selectedSubmission.category.replace(/_/g, ' ')}
                  </p>
                </div>

                {selectedSubmission.textContent && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-dark-gray mb-3 tracking-wider">CONTENT</h3>
                    <p className="text-base leading-relaxed whitespace-pre-wrap bg-background p-5 rounded-xl border-2 border-light-gray">
                      {selectedSubmission.textContent}
                    </p>
                  </div>
                )}

                {selectedSubmission.mediaUrl && (
                  <div className="mb-6">
                    {selectedSubmission.contentType === 'AUDIO' || selectedSubmission.mediaUrl?.match(/\.(mp3|wav|webm|ogg|m4a)$/i) ? (
                      <>
                        <h3 className="text-xs font-bold text-dark-gray mb-3 tracking-wider">🎵 AUDIO RECORDING</h3>
                        <audio
                          controls
                          src={selectedSubmission.mediaUrl}
                          className="w-full rounded-xl shadow-sm"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-xs font-bold text-dark-gray mb-3 tracking-wider">
                          {selectedSubmission.drawingData ? '🎨 DRAWING' : '📷 IMAGE ATTACHMENT'}
                        </h3>
                        <Image
                          src={selectedSubmission.mediaUrl}
                          alt="Submission media"
                          width={800}
                          height={600}
                          className="w-full h-auto rounded-xl border-2 border-light-gray shadow-sm"
                          unoptimized={selectedSubmission.mediaUrl?.startsWith('data:')}
                        />
                      </>
                    )}
                  </div>
                )}

                {selectedSubmission.drawingData && !selectedSubmission.mediaUrl && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-dark-gray mb-3 tracking-wider">🎨 DRAWING</h3>
                    <img
                      src={selectedSubmission.drawingData}
                      alt="User drawing"
                      className="max-w-full rounded-xl border-2 border-light-gray shadow-sm bg-white"
                    />
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex gap-3 pt-6 border-t-2 border-light-gray flex-wrap">
                  {selectedSubmission.status === 'PENDING' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'APPROVED')}
                        disabled={actionLoading}
                        icon={<Check className="h-4 w-4" />}
                        className="flex-1"
                      >
                        Approve Submission
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'REJECTED')}
                        disabled={actionLoading}
                        icon={<X className="h-4 w-4" />}
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Reject Submission
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                    className={selectedSubmission.status === 'PENDING' ? '' : 'flex-1'}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
