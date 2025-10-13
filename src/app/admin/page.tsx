'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter
} from 'lucide-react';

interface Submission {
  id: string;
  category: string;
  contentType: string;
  textContent: string | null;
  status: string;
  submittedAt: string;
  user: {
    id: string;
    name: string;
  } | null;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? '' : `status=${filter}`;
      const response = await fetch(`/api/submissions?${status}`);
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/submissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSubmissions();
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Failed to update submission:', error);
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
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage community magazine submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {submissions.filter(s => s.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.status === 'APPROVED').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.status === 'REJECTED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            <Filter className="mr-2 h-4 w-4" />
            All
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setFilter('PENDING')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Button>
          <Button
            variant={filter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setFilter('APPROVED')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approved
          </Button>
          <Button
            variant={filter === 'REJECTED' ? 'default' : 'outline'}
            onClick={() => setFilter('REJECTED')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejected
          </Button>
          <Button
            variant="outline"
            onClick={fetchSubmissions}
            className="ml-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              Click on a submission to review and manage it
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No submissions found
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {getCategoryEmoji(submission.category)}
                          </span>
                          <div>
                            <div className="font-semibold">
                              {submission.category.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              By {submission.user?.name || 'Anonymous'} • 
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {submission.textContent && (
                          <p className="text-sm line-clamp-2 mb-2">
                            {submission.textContent}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">
                    {getCategoryEmoji(selectedSubmission.category)}
                  </span>
                  Review Submission
                </CardTitle>
                <CardDescription>
                  Submitted by {selectedSubmission.user?.name || 'Anonymous'} on{' '}
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <p>{selectedSubmission.category.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Content</h3>
                  <p className="whitespace-pre-wrap">
                    {selectedSubmission.textContent || 'No text content'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Current Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-4">
                  {selectedSubmission.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'APPROVED')}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'REJECTED')}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
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