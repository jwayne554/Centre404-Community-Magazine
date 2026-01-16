'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/ui/Layout';
import { FileText, Image, Mic, Pencil, Clock, CheckCircle, XCircle, BookOpen, ExternalLink } from 'lucide-react';
import { getCategoryLabel } from '@/utils/category-helpers';

interface PublishedIn {
  magazineId: string;
  title: string;
  publishedAt: string | null;
}

interface Submission {
  id: string;
  category: string;
  contentType: string;
  textContent: string | null;
  mediaUrl: string | null;
  drawingData: string | null;
  status: string;
  submittedAt: string;
  authorName: string;
  isPublished: boolean;
  publishedIn: PublishedIn[];
}

interface SubmissionsResponse {
  submissions: Submission[];
  count: number;
}

const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case 'TEXT':
      return <FileText className="h-5 w-5" />;
    case 'IMAGE':
      return <Image className="h-5 w-5" />;
    case 'AUDIO':
      return <Mic className="h-5 w-5" />;
    case 'DRAWING':
      return <Pencil className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          Pending Review
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Not Selected
        </span>
      );
    default:
      return null;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // Get sessionId from localStorage
        let sessionId: string | null = null;
        try {
          sessionId = localStorage.getItem('sessionId');
        } catch {
          // localStorage not available
        }

        if (!sessionId) {
          setSubmissions([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/my-submissions?sessionId=${encodeURIComponent(sessionId)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data: SubmissionsResponse = await response.json();
        setSubmissions(data.submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-charcoal mb-2">My Submissions</h1>
          <p className="text-dark-gray">
            Track the status of your contributions to the community magazine.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-dark-gray">Loading your submissions...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-8 text-center">
            <FileText className="h-12 w-12 text-dark-gray mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-charcoal mb-2">No submissions yet</h2>
            <p className="text-dark-gray mb-6">
              You haven&apos;t submitted anything to the community magazine yet.
              Share your stories, artwork, or recordings with the community!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Pencil className="h-5 w-5" />
              Submit Something
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-card p-4">
              <p className="text-dark-gray">
                You have <span className="font-semibold text-charcoal">{submissions.length}</span> submission{submissions.length !== 1 ? 's' : ''}.
              </p>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Content Type Icon */}
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {getContentTypeIcon(submission.contentType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-charcoal">
                            {getCategoryLabel(submission.category)}
                          </span>
                          {getStatusBadge(submission.status)}
                        </div>

                        {submission.textContent && (
                          <p className="text-dark-gray text-sm line-clamp-2 mb-2">
                            {submission.textContent}
                          </p>
                        )}

                        {submission.drawingData && (
                          <p className="text-dark-gray text-sm italic mb-2">
                            Contains a drawing
                          </p>
                        )}

                        {submission.mediaUrl && (
                          <p className="text-dark-gray text-sm italic mb-2">
                            {submission.contentType === 'AUDIO' ? 'Contains audio recording' : 'Contains image'}
                          </p>
                        )}

                        <p className="text-xs text-dark-gray">
                          Submitted on {formatDate(submission.submittedAt)}
                        </p>

                        {/* Published In */}
                        {submission.isPublished && submission.publishedIn.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-light-gray">
                            <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Published in:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {submission.publishedIn.map((mag) => (
                                <Link
                                  key={mag.magazineId}
                                  href={`/magazines/${mag.magazineId}`}
                                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                  {mag.title}
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <Pencil className="h-5 w-5" />
                Submit another story
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
