'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Eye,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  category: string;
  contentType: string;
  textContent: string | null;
  mediaUrl: string | null;
  status: string;
  submittedAt: string;
  user: {
    id: string;
    name: string;
  } | null;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAllSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, allSubmissions]);

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

  const filterSubmissions = () => {
    if (activeTab === 'ALL') {
      setSubmissions(allSubmissions);
    } else {
      setSubmissions(allSubmissions.filter(s => s.status === activeTab));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: allSubmissions.length,
    pending: allSubmissions.filter(s => s.status === 'PENDING').length,
    approved: allSubmissions.filter(s => s.status === 'APPROVED').length,
    rejected: allSubmissions.filter(s => s.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage community magazine submissions and compile editions</p>
          </div>
          <Link href="/admin/compile">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Compile Magazine
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('ALL')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                All Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500" onClick={() => setActiveTab('PENDING')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs your attention</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500" onClick={() => setActiveTab('APPROVED')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for compilation</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-500" onClick={() => setActiveTab('REJECTED')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setActiveTab('PENDING')}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Pending ({stats.pending})
            </Button>
            <Button
              variant={activeTab === 'APPROVED' ? 'default' : 'outline'}
              onClick={() => setActiveTab('APPROVED')}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approved ({stats.approved})
            </Button>
            <Button
              variant={activeTab === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setActiveTab('REJECTED')}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rejected ({stats.rejected})
            </Button>
          </div>

          <div className="flex gap-2">
            {selectedIds.size > 0 && activeTab === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  onClick={bulkApprove}
                  disabled={actionLoading}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Selected ({selectedIds.size})
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={fetchAllSubmissions}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {submissions.length > 0 && activeTab === 'PENDING' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === submissions.length && submissions.length > 0}
                onChange={selectAll}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </span>
            </label>
            {selectedIds.size > 0 && (
              <span className="text-sm text-blue-700">Bulk actions available →</span>
            )}
          </div>
        )}

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'ALL' ? 'All Submissions' :
               activeTab === 'PENDING' ? 'Pending Review' :
               activeTab === 'APPROVED' ? 'Approved Submissions' :
               'Rejected Submissions'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'PENDING' && 'Review these submissions to approve or reject them'}
              {activeTab === 'APPROVED' && 'These submissions are ready to be compiled into magazines'}
              {activeTab === 'REJECTED' && 'These submissions were not approved'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p>Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No submissions found</p>
                {activeTab === 'PENDING' && (
                  <p className="text-sm">All caught up! No pending reviews.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      {activeTab === 'PENDING' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(submission.id)}
                          onChange={() => toggleSelection(submission.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-4 h-4"
                        />
                      )}

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {getCategoryEmoji(submission.category)}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold">
                              {submission.category.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              By {submission.user?.name || 'Anonymous'} •
                              {new Date(submission.submittedAt).toLocaleString()}
                            </div>
                          </div>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>

                        {/* Text Preview */}
                        {submission.textContent && (
                          <p className="text-sm line-clamp-2 mb-2 text-muted-foreground">
                            {submission.textContent}
                          </p>
                        )}

                        {/* Media Indicator */}
                        {submission.mediaUrl && (
                          <div className="text-xs text-blue-600 mb-2">
                            📎 Contains media attachment
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>

                        {submission.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateSubmissionStatus(submission.id, 'APPROVED')}
                              disabled={actionLoading}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateSubmissionStatus(submission.id, 'REJECTED')}
                              disabled={actionLoading}
                              className="gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Modal */}
        {selectedSubmission && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedSubmission(null)}
          >
            <Card
              className="max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {getCategoryEmoji(selectedSubmission.category)}
                      </span>
                      Review Submission
                    </CardTitle>
                    <CardDescription>
                      Submitted by {selectedSubmission.user?.name || 'Anonymous'} on{' '}
                      {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">CATEGORY</h3>
                  <p className="text-lg">{selectedSubmission.category.replace(/_/g, ' ')}</p>
                </div>

                {selectedSubmission.textContent && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm text-muted-foreground">CONTENT</h3>
                    <p className="whitespace-pre-wrap text-base leading-relaxed">
                      {selectedSubmission.textContent}
                    </p>
                  </div>
                )}

                {selectedSubmission.mediaUrl && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm text-muted-foreground">MEDIA</h3>
                    <img
                      src={selectedSubmission.mediaUrl}
                      alt="Submission media"
                      className="max-w-full rounded-lg border"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {selectedSubmission.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => {
                          updateSubmissionStatus(selectedSubmission.id, 'APPROVED');
                        }}
                        disabled={actionLoading}
                        className="flex-1 gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          updateSubmissionStatus(selectedSubmission.id, 'REJECTED');
                        }}
                        disabled={actionLoading}
                        className="flex-1 gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
