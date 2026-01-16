'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getCategoryEmoji, getCategoryLabel } from '@/utils/category-helpers';
import StatusCard from '@/components/admin/StatusCard';
import SubmissionItem from '@/components/admin/SubmissionItem';
import Button from '@/components/ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
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
  Loader2,
  BookOpen,
  Check,
  X,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  AlertTriangle,
  History,
  Eye,
  Keyboard,
  Inbox,
  Heart,
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
  const toast = useToast();

  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // P3-1: Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // P3-2: Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // P3-3 & P3-4: Confirmation dialog & rejection reason
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: 'approve' | 'reject' | 'bulk-approve' | 'bulk-reject';
    submissionId?: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // P3-5: Magazine preview
  const [showMagazinePreview, setShowMagazinePreview] = useState(false);

  // P3-6: Keyboard shortcuts help
  const [showShortcuts, setShowShortcuts] = useState(false);

  // P3-7: Sorting
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'category' | 'author'>('newest');

  // Modal ref for focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close modal function
  const closeModal = useCallback(() => {
    setSelectedSubmission(null);
  }, []);

  // Focus trap and keyboard handling for modal
  useEffect(() => {
    if (selectedSubmission && modalRef.current) {
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();

      // Store previously focused element
      const previouslyFocused = document.activeElement as HTMLElement;

      // Handle escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
          return;
        }

        // Focus trap: keep focus within modal
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        // Return focus to previously focused element
        previouslyFocused?.focus();
      };
    }
  }, [selectedSubmission, closeModal]);

  // Memoize filtered, searched, and sorted submissions
  const submissions = useMemo(() => {
    let filtered = allSubmissions.filter(s => s.status === selectedTab);

    // P3-2: Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        (s.user?.name || 'anonymous').toLowerCase().includes(query) ||
        (s.textContent || '').toLowerCase().includes(query)
      );
    }

    // P3-2: Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    // P3-7: Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        case 'author':
          return (a.user?.name || 'Anonymous').localeCompare(b.user?.name || 'Anonymous');
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedTab, allSubmissions, searchQuery, categoryFilter, sortBy]);

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
        toast.success(`Submission ${status.toLowerCase()} successfully!`);
      } else {
        // Rollback on error
        setAllSubmissions(previousSubmissions);
        setSelectedSubmission(previousSelectedSubmission);

        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(`Failed to update submission: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      // Rollback on error
      setAllSubmissions(previousSubmissions);
      setSelectedSubmission(previousSelectedSubmission);

      console.error('Failed to update submission:', error);
      toast.error('Failed to update submission. Please try again.');
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

  // P3-1: Bulk selection handlers
  const handleSelectSubmission = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === submissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map(s => s.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // P3-1: Bulk action handlers
  const handleBulkAction = async (status: 'APPROVED' | 'REJECTED') => {
    setBulkActionLoading(true);
    const ids = Array.from(selectedIds);
    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        const response = await fetch(`/api/submissions/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status, reason: status === 'REJECTED' ? rejectReason : undefined }),
        });
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    await fetchAllSubmissions();
    clearSelection();
    setConfirmDialog(null);
    setRejectReason('');
    setBulkActionLoading(false);

    if (failCount === 0) {
      toast.success(`${successCount} submission${successCount > 1 ? 's' : ''} ${status.toLowerCase()} successfully!`);
    } else {
      toast.error(`${successCount} succeeded, ${failCount} failed`);
    }
  };

  // P3-3: Confirmation dialog handlers
  const showConfirmDialog = (action: 'approve' | 'reject' | 'bulk-approve' | 'bulk-reject', submissionId?: string) => {
    const isBulk = action.startsWith('bulk-');
    const isReject = action.includes('reject');

    setConfirmDialog({
      isOpen: true,
      title: isReject ? 'Confirm Rejection' : 'Confirm Approval',
      message: isBulk
        ? `Are you sure you want to ${isReject ? 'reject' : 'approve'} ${selectedIds.size} submission${selectedIds.size > 1 ? 's' : ''}?`
        : `Are you sure you want to ${isReject ? 'reject' : 'approve'} this submission?`,
      action,
      submissionId,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;

    if (confirmDialog.action === 'bulk-approve') {
      await handleBulkAction('APPROVED');
    } else if (confirmDialog.action === 'bulk-reject') {
      await handleBulkAction('REJECTED');
    } else if (confirmDialog.submissionId) {
      const status = confirmDialog.action === 'approve' ? 'APPROVED' : 'REJECTED';
      await updateSubmissionStatus(confirmDialog.submissionId, status);
      setConfirmDialog(null);
      setRejectReason('');
    }
  };

  // P3-6: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Show shortcuts help with ?
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // Close shortcuts with Escape
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
        return;
      }

      // Shortcuts when modal is open
      if (selectedSubmission) {
        if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (selectedSubmission.status !== 'APPROVED') {
            showConfirmDialog('approve', selectedSubmission.id);
          }
        }
        if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (selectedSubmission.status !== 'REJECTED') {
            showConfirmDialog('reject', selectedSubmission.id);
          }
        }
      }

      // Shortcuts for bulk actions
      if (selectedIds.size > 0 && !selectedSubmission) {
        if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          showConfirmDialog('bulk-approve');
        }
        if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          showConfirmDialog('bulk-reject');
        }
      }

      // Refresh with Cmd+Shift+R
      if (e.key === 'r' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fetchAllSubmissions();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSubmission, selectedIds, showShortcuts]);

  // Clear selection when tab changes
  useEffect(() => {
    clearSelection();
  }, [selectedTab]);

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
          <Link href="/admin/magazines">
            <Button
              variant="outline"
              icon={<BookOpen className="h-4 w-4" />}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40"
            >
              Manage Magazines
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
          <Button
            variant="outline"
            icon={<Keyboard className="h-4 w-4" />}
            onClick={() => setShowShortcuts(true)}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40"
            aria-label="Keyboard shortcuts"
          >
            <span className="hidden sm:inline">Shortcuts</span>
            <span className="sm:hidden">?</span>
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

      {/* P3-2: Search and Filters */}
      <div className="bg-white rounded-xl shadow-card border border-light-gray p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-gray" />
            <input
              type="text"
              placeholder="Search by author or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-light-gray focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
              aria-label="Search submissions"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-gray pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-lg border border-light-gray focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white cursor-pointer min-w-[160px]"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="MY_NEWS">My News</option>
              <option value="SAYING_HELLO">Saying Hello</option>
              <option value="MY_SAY">My Say</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-gray pointer-events-none" />
          </div>

          {/* P3-7: Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="pl-4 pr-8 py-2.5 rounded-lg border border-light-gray focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white cursor-pointer min-w-[140px]"
              aria-label="Sort submissions"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="category">By Category</option>
              <option value="author">By Author</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-gray pointer-events-none" />
          </div>
        </div>

        {/* Active filters indicator */}
        {(searchQuery || categoryFilter) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-light-gray">
            <span className="text-sm text-dark-gray">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                {getCategoryLabel(categoryFilter)}
                <button
                  onClick={() => setCategoryFilter('')}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                  aria-label="Clear category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
              className="text-xs text-dark-gray hover:text-primary ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* P3-1: Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-medium text-primary">
              {selectedIds.size} submission{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-dark-gray hover:text-primary"
            >
              Clear selection
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Check className="h-4 w-4" />}
              onClick={() => showConfirmDialog('bulk-approve')}
              disabled={bulkActionLoading}
            >
              Approve All
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={() => showConfirmDialog('bulk-reject')}
              disabled={bulkActionLoading}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Reject All
            </Button>
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {selectedTab === 'APPROVED' && <CheckCircle className="h-6 w-6 text-primary" />}
              {selectedTab === 'PENDING' && <Clock className="h-6 w-6 text-yellow-600" />}
              {selectedTab === 'REJECTED' && <XCircle className="h-6 w-6 text-red-600" />}
              <h2 className="text-xl font-semibold text-charcoal">
                {selectedTab === 'APPROVED' && 'Approved Submissions'}
                {selectedTab === 'PENDING' && 'Pending Review'}
                {selectedTab === 'REJECTED' && 'Rejected Submissions'}
              </h2>
            </div>
            {/* Select All checkbox */}
            {submissions.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-dark-gray hover:text-primary">
                <input
                  type="checkbox"
                  checked={selectedIds.size === submissions.length && submissions.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-dark-gray/40 text-primary focus:ring-primary"
                />
                Select All ({submissions.length})
              </label>
            )}
          </div>
          <p className="text-dark-gray mb-6 text-sm leading-relaxed">
            {selectedTab === 'APPROVED' && 'These submissions are ready to be compiled into magazines'}
            {selectedTab === 'PENDING' && 'Review these submissions to approve or reject'}
            {selectedTab === 'REJECTED' && 'These submissions were not approved for publication'}
          </p>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
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
                  selectable={true}
                  selected={selectedIds.has(submission.id)}
                  onSelect={handleSelectSubmission}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-xl border-2 border-dashed border-light-gray">
              <Inbox className="h-12 w-12 text-dark-gray mx-auto mb-4" />
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
      <Modal
        isOpen={!!selectedSubmission}
        onClose={closeModal}
        size="xl"
        variant="bottomSheet"
        manageFocus={false}
        titleId="modal-title"
      >
        {selectedSubmission && (
          <>
            <ModalHeader onClose={closeModal}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-2xl sm:text-4xl" aria-hidden="true">{getCategoryEmoji(selectedSubmission.category)}</span>
                <h2 id="modal-title" className="text-lg sm:text-2xl font-bold truncate">
                  Review: {getCategoryLabel(selectedSubmission.category)}
                </h2>
              </div>
              <p className="text-dark-gray text-sm">
                {selectedSubmission.user?.name || 'Anonymous'} •
                {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
              </p>
            </ModalHeader>

            <ModalBody>
              {selectedSubmission.textContent && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Content</h3>
                  <p className="text-charcoal leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.textContent}
                  </p>
                </div>
              )}

              {/* Image preview - only show if NOT audio content */}
              {selectedSubmission.mediaUrl &&
               selectedSubmission.contentType !== 'AUDIO' &&
               !selectedSubmission.mediaUrl.endsWith('.webm') && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Image</h3>
                  <Image
                    src={selectedSubmission.mediaUrl}
                    alt={`Image submitted by ${selectedSubmission.user?.name || 'Anonymous'} in ${getCategoryLabel(selectedSubmission.category)}`}
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
                          img.onerror = () => {
                            // Show error state on canvas
                            canvas.width = 300;
                            canvas.height = 100;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.fillStyle = '#fef2f2';
                              ctx.fillRect(0, 0, 300, 100);
                              ctx.fillStyle = '#dc2626';
                              ctx.font = '14px Inter, sans-serif';
                              ctx.textAlign = 'center';
                              ctx.fillText('Failed to load drawing', 150, 55);
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

              {/* Audio preview - for audio submissions */}
              {selectedSubmission.mediaUrl &&
               (selectedSubmission.contentType === 'AUDIO' ||
                selectedSubmission.contentType === 'MIXED' ||
                selectedSubmission.mediaUrl.endsWith('.webm')) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Audio Recording</h3>
                  <div className="bg-background p-4 rounded-lg border border-light-gray">
                    <audio
                      controls
                      src={selectedSubmission.mediaUrl}
                      className="w-full"
                      aria-label={`Audio recording by ${selectedSubmission.user?.name || 'Anonymous'} for ${getCategoryLabel(selectedSubmission.category)}`}
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              {/* P3-5: Preview and P3-8: History links */}
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="h-4 w-4" />}
                  onClick={() => setShowMagazinePreview(true)}
                  className="flex-1"
                >
                  Preview in Magazine
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<History className="h-4 w-4" />}
                  onClick={() => toast.info('Audit log feature coming soon')}
                  className="flex-1"
                >
                  View History
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  icon={<Check className="h-4 w-4" />}
                  onClick={() => showConfirmDialog('approve', selectedSubmission.id)}
                  disabled={actionLoading || selectedSubmission.status === 'APPROVED'}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  icon={<X className="h-4 w-4" />}
                  onClick={() => showConfirmDialog('reject', selectedSubmission.id)}
                  disabled={actionLoading || selectedSubmission.status === 'REJECTED'}
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
              {/* Keyboard shortcut hint */}
              <p className="text-xs text-dark-gray text-center mt-2">
                Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">⌘A</kbd> to approve or <kbd className="px-1 py-0.5 bg-background rounded text-xs">⌘R</kbd> to reject
              </p>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* P3-3 & P3-4: Confirmation Dialog */}
      <Modal
        isOpen={!!confirmDialog?.isOpen}
        onClose={() => { setConfirmDialog(null); setRejectReason(''); }}
        size="md"
        variant="alertdialog"
        zIndex={60}
        titleId="confirm-title"
        descriptionId="confirm-desc"
        closeOnBackdropClick={false}
      >
        {confirmDialog && (
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-2 rounded-full ${confirmDialog.action.includes('reject') ? 'bg-red-50' : 'bg-primary/10'}`}>
                <AlertTriangle className={`h-6 w-6 ${confirmDialog.action.includes('reject') ? 'text-red-700' : 'text-primary'}`} />
              </div>
              <div>
                <h3 id="confirm-title" className="text-lg font-bold">
                  {confirmDialog.title}
                </h3>
                <p id="confirm-desc" className="text-dark-gray mt-1">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            {/* P3-4: Rejection reason input */}
            {confirmDialog.action.includes('reject') && (
              <div className="mb-4">
                <label htmlFor="reject-reason" className="block text-sm font-medium mb-1">
                  Reason (optional, shared with contributor)
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Please resubmit with a clearer photo"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-light-gray focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setConfirmDialog(null); setRejectReason(''); }}
                className="flex-1"
                disabled={bulkActionLoading || actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={confirmDialog.action.includes('reject') ? 'outline' : 'primary'}
                onClick={handleConfirmAction}
                disabled={bulkActionLoading || actionLoading}
                className={`flex-1 ${confirmDialog.action.includes('reject') ? 'text-red-600 border-red-600 hover:bg-red-50' : ''}`}
              >
                {bulkActionLoading || actionLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* P3-6: Keyboard Shortcuts Modal */}
      <Modal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        title="Keyboard Shortcuts"
        titleId="shortcuts-title"
        size="md"
        zIndex={60}
      >
        <ModalHeader onClose={() => setShowShortcuts(false)}>
          <h3 id="shortcuts-title" className="text-lg font-bold flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </h3>
        </ModalHeader>
        <ModalBody scrollable={false}>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-light-gray">
              <span className="text-dark-gray">Approve submission</span>
              <kbd className="px-2 py-1 bg-background rounded text-sm font-mono">⌘ + A</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-light-gray">
              <span className="text-dark-gray">Reject submission</span>
              <kbd className="px-2 py-1 bg-background rounded text-sm font-mono">⌘ + R</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-light-gray">
              <span className="text-dark-gray">Refresh submissions</span>
              <kbd className="px-2 py-1 bg-background rounded text-sm font-mono">⌘ + ⇧ + R</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-light-gray">
              <span className="text-dark-gray">Close modal / dialog</span>
              <kbd className="px-2 py-1 bg-background rounded text-sm font-mono">Esc</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-dark-gray">Show this help</span>
              <kbd className="px-2 py-1 bg-background rounded text-sm font-mono">?</kbd>
            </div>
          </div>
          <p className="text-xs text-dark-gray mt-4 text-center">
            Shortcuts work when reviewing a submission or with items selected
          </p>
        </ModalBody>
      </Modal>

      {/* P3-5: Magazine Preview Modal */}
      <Modal
        isOpen={showMagazinePreview && !!selectedSubmission}
        onClose={() => setShowMagazinePreview(false)}
        title="Magazine Preview"
        titleId="preview-title"
        size="xl"
        zIndex={60}
      >
        <ModalHeader onClose={() => setShowMagazinePreview(false)}>
          <h3 id="preview-title" className="text-lg font-bold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Magazine Preview
          </h3>
        </ModalHeader>
        <ModalBody>
          {selectedSubmission && (
            <>
              {/* Simulated magazine article */}
              <div className="border border-light-gray rounded-xl overflow-hidden">
                <div className="p-6">
                  {/* Category and Author */}
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">{getCategoryEmoji(selectedSubmission.category)}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium mr-3">
                      {getCategoryLabel(selectedSubmission.category)}
                    </span>
                    <span className="text-dark-gray text-sm">
                      By {selectedSubmission.user?.name || 'Anonymous'}
                    </span>
                  </div>

                  {/* Content */}
                  {selectedSubmission.textContent && (
                    <p className="mb-4 whitespace-pre-wrap">{selectedSubmission.textContent}</p>
                  )}

                  {/* Image */}
                  {selectedSubmission.mediaUrl &&
                   selectedSubmission.contentType !== 'AUDIO' &&
                   !selectedSubmission.mediaUrl.endsWith('.webm') && (
                    <div className="mb-4 -mx-6">
                      <Image
                        src={selectedSubmission.mediaUrl}
                        alt={`Photo by ${selectedSubmission.user?.name || 'Anonymous'}`}
                        width={800}
                        height={400}
                        className="w-full h-auto object-cover max-h-96"
                      />
                    </div>
                  )}

                  {/* Drawing */}
                  {selectedSubmission.drawingData && (
                    <div className="mb-4">
                      <img
                        src={selectedSubmission.drawingData}
                        alt={`Drawing by ${selectedSubmission.user?.name || 'Anonymous'}`}
                        className="max-w-full h-auto rounded-lg border border-light-gray"
                      />
                    </div>
                  )}

                  {/* Like button placeholder */}
                  <div className="flex items-center space-x-3 pt-2 border-t border-light-gray">
                    <button className="flex items-center gap-1 text-dark-gray" disabled>
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">0 likes</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-dark-gray text-center mt-4">
                This is how the submission will appear in the published magazine
              </p>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole={['ADMIN', 'MODERATOR']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
