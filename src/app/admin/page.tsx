'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getCategoryEmoji } from '@/utils/category-helpers';
import StatusCard from '@/components/admin/StatusCard';
import SubmissionItem from '@/components/admin/SubmissionItem';
import Button from '@/components/ui/Button';
import {
  LockKeyhole,
  LogOut,
  Home,
  Archive,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  BookOpen,
  Check,
  X,
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

function AdminDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Memoize filtered submissions
  const submissions = useMemo(() => {
    return allSubmissions.filter(s => s.status === selectedTab);
  }, [selectedTab, allSubmissions]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: allSubmissions.length,
    pending: allSubmissions.filter(s => s.status === 'PENDING').length,
    approved: allSubmissions.filter(s => s.status === 'APPROVED').length,
    rejected: allSubmissions.filter(s => s.status === 'REJECTED').length,
  }), [allSubmissions]);

  useEffect(() => {
    fetchAllSubmissions();
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

  const updateSubmissionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);

    const previousSubmissions = allSubmissions;
    const previousSelectedSubmission = selectedSubmission;

    // Optimistic update
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
      } else {
        // Rollback on error
        setAllSubmissions(previousSubmissions);
        setSelectedSubmission(previousSelectedSubmission);

        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to update submission: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      // Rollback on error
      setAllSubmissions(previousSubmissions);
      setSelectedSubmission(previousSelectedSubmission);

      console.error('Failed to update submission:', error);
      alert('Failed to update submission. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompileMagazine = () => {
    router.push('/admin/compile');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="pb-8">
      {/* Header Section - Green Gradient */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-white/90 mb-8 text-lg">
          Review submissions, manage content, and compile magazine editions
        </p>

        {/* Admin Info Bar */}
        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-semibold">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div>
              <p className="text-lg font-medium">{user?.name || 'Admin User'}</p>
              <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase">
                {user?.role || 'Administrator'}
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
            className="bg-white/90 hover:bg-white text-red-600 border-0 shadow-sm"
          >
            Logout
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link href="/">
            <Button
              variant="outline"
              icon={<Home className="h-4 w-4" />}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40"
            >
              Home
            </Button>
          </Link>
          <Link href="/magazines">
            <Button
              variant="outline"
              icon={<Archive className="h-4 w-4" />}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40"
            >
              Archive
            </Button>
          </Link>
          <Button
            variant="secondary"
            icon={<BookOpen className="h-4 w-4" />}
            onClick={handleCompileMagazine}
            className="bg-accent hover:bg-accent/90 text-charcoal font-semibold shadow-sm"
          >
            Compile Magazine
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatusCard
          title="All Submissions"
          subtitle="Total submissions"
          count={stats.total}
          icon={<BarChart3 className="h-6 w-6" />}
        />
        <StatusCard
          title="Pending Review"
          subtitle="Needs attention"
          count={stats.pending}
          icon={<Clock className="h-6 w-6" />}
          variant="pending"
        />
        <StatusCard
          title="Approved"
          subtitle="Ready for magazine"
          count={stats.approved}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="approved"
        />
        <StatusCard
          title="Rejected"
          subtitle="Not published"
          count={stats.rejected}
          icon={<XCircle className="h-6 w-6" />}
          variant="rejected"
        />
      </div>

      {/* Tabs and Submissions List */}
      <div className="bg-white rounded-xl shadow-card border border-light-gray mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-light-gray">
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedTab('APPROVED')}
              className={`px-5 py-2.5 font-medium rounded-lg transition-all ${
                selectedTab === 'APPROVED'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark-gray hover:bg-background'
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setSelectedTab('PENDING')}
              className={`px-5 py-2.5 font-medium rounded-lg transition-all ${
                selectedTab === 'PENDING'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark-gray hover:bg-background'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setSelectedTab('REJECTED')}
              className={`px-5 py-2.5 font-medium rounded-lg transition-all ${
                selectedTab === 'REJECTED'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark-gray hover:bg-background'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchAllSubmissions}
          >
            Refresh
          </Button>
        </div>

        {/* Submissions List */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {selectedTab === 'APPROVED' && <CheckCircle className="h-6 w-6 text-primary" />}
            {selectedTab === 'PENDING' && <Clock className="h-6 w-6 text-yellow-600" />}
            {selectedTab === 'REJECTED' && <XCircle className="h-6 w-6 text-red-600" />}
            <h2 className="text-xl font-semibold text-charcoal">
              {selectedTab === 'APPROVED' && 'Approved Submissions'}
              {selectedTab === 'PENDING' && 'Pending Review'}
              {selectedTab === 'REJECTED' && 'Rejected Submissions'}
            </h2>
          </div>
          <p className="text-dark-gray mb-6 text-sm leading-relaxed">
            {selectedTab === 'APPROVED' && 'These submissions are ready to be compiled into magazines'}
            {selectedTab === 'PENDING' && 'Review these submissions to approve or reject'}
            {selectedTab === 'REJECTED' && 'These submissions were not approved for publication'}
          </p>

          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-dark-gray">Loading submissions...</p>
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map(submission => (
                <SubmissionItem
                  key={submission.id}
                  id={submission.id}
                  category={submission.category}
                  author={submission.user?.name || 'Anonymous'}
                  date={submission.submittedAt}
                  content={submission.textContent}
                  status={submission.status as 'APPROVED' | 'PENDING' | 'REJECTED'}
                  hasImage={!!submission.mediaUrl}
                  imageUrl={submission.mediaUrl}
                  hasDrawing={!!submission.drawingData}
                  onViewFull={() => setSelectedSubmission(submission)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-xl border-2 border-dashed border-light-gray">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-dark-gray text-lg font-medium mb-1">
                No {selectedTab.toLowerCase()} submissions
              </p>
              <p className="text-dark-gray text-sm">
                {selectedTab === 'PENDING' && 'All caught up! Check back later for new submissions.'}
                {selectedTab === 'APPROVED' && 'No approved submissions yet.'}
                {selectedTab === 'REJECTED' && 'No rejected submissions.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-light-gray">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{getCategoryEmoji(selectedSubmission.category)}</span>
                    <h2 className="text-2xl font-bold">{selectedSubmission.category}</h2>
                  </div>
                  <p className="text-dark-gray text-sm">
                    {selectedSubmission.user?.name || 'Anonymous'} •
                    {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-dark-gray hover:text-charcoal p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedSubmission.textContent && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Content</h3>
                  <p className="text-charcoal leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.textContent}
                  </p>
                </div>
              )}

              {selectedSubmission.mediaUrl && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Image</h3>
                  <Image
                    src={selectedSubmission.mediaUrl}
                    alt="Submission"
                    width={600}
                    height={400}
                    className="rounded-lg border border-light-gray w-full"
                  />
                </div>
              )}

              {selectedSubmission.drawingData && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Drawing</h3>
                  <div className="bg-background p-4 rounded-lg border border-light-gray">
                    <canvas
                      ref={(canvas) => {
                        if (canvas && selectedSubmission.drawingData) {
                          const img = new window.Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(img, 0, 0);
                            }
                          };
                          img.src = selectedSubmission.drawingData;
                        }
                      }}
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-light-gray">
                <Button
                  variant="primary"
                  icon={<Check className="h-4 w-4" />}
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'APPROVED')}
                  disabled={actionLoading || selectedSubmission.status === 'APPROVED'}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  icon={<X className="h-4 w-4" />}
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'REJECTED')}
                  disabled={actionLoading || selectedSubmission.status === 'REJECTED'}
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
