'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import StatusCard from '@/components/admin/StatusCard';
import {
  BookOpen,
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle,
  Archive,
  Trash2,
  Send,
  Eye,
  Calendar,
} from 'lucide-react';

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    submission: {
      id: string;
      category: string;
    };
  }>;
}

interface MagazineStats {
  draft: number;
  published: number;
  archived: number;
  total: number;
}

function AdminMagazinesContent() {
  const router = useRouter();
  const toast = useToast();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [stats, setStats] = useState<MagazineStats>({ draft: 0, published: 0, archived: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDraftMagazines();
  }, []);

  const fetchDraftMagazines = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/magazines/drafts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMagazines(data.magazines || []);
        setStats(data.stats || { draft: 0, published: 0, archived: 0, total: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch draft magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'publish' }),
      });

      if (response.ok) {
        await fetchDraftMagazines();
        toast.success('Magazine published successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to publish: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to publish magazine:', error);
      toast.error('Failed to publish magazine. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(id);
    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchDraftMagazines();
        toast.success('Magazine deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete magazine:', error);
      toast.error('Failed to delete magazine. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold">Magazine Management</h1>
        </div>
        <p className="text-white/90 mb-6 text-lg">
          View, publish, and manage magazine drafts
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin">
            <Button
              variant="outline"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40"
            >
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/admin/compile">
            <Button
              variant="secondary"
              icon={<BookOpen className="h-4 w-4" />}
              className="bg-accent hover:bg-accent/90 text-charcoal font-semibold shadow-sm"
            >
              Create New Magazine
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatusCard
          title="Total Magazines"
          subtitle="All editions"
          count={stats.total}
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatusCard
          title="Draft"
          subtitle="Awaiting publication"
          count={stats.draft}
          icon={<FileText className="h-6 w-6" />}
          variant="pending"
        />
        <StatusCard
          title="Published"
          subtitle="Live editions"
          count={stats.published}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="approved"
        />
        <StatusCard
          title="Archived"
          subtitle="Past editions"
          count={stats.archived}
          icon={<Archive className="h-6 w-6" />}
          variant="rejected"
        />
      </div>

      {/* Draft Magazines List */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-light-gray flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-charcoal">Draft Magazines</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchDraftMagazines}
          >
            Refresh
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-dark-gray">Loading magazines...</p>
            </div>
          ) : magazines.length > 0 ? (
            <div className="space-y-4">
              {magazines.map((magazine) => (
                <Card key={magazine.id} className="border border-light-gray">
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-charcoal">
                            {magazine.title}
                          </h3>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            DRAFT
                          </span>
                        </div>
                        {magazine.description && (
                          <p className="text-dark-gray text-sm mb-2">
                            {magazine.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-dark-gray">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created: {formatDate(magazine.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {magazine.items.length} articles
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => router.push(`/magazines/${magazine.id}`)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Send className="h-4 w-4" />}
                          onClick={() => handlePublish(magazine.id)}
                          disabled={actionLoading === magazine.id}
                        >
                          {actionLoading === magazine.id ? 'Publishing...' : 'Publish'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDelete(magazine.id, magazine.title)}
                          disabled={actionLoading === magazine.id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-xl border-2 border-dashed border-light-gray">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-dark-gray text-lg font-medium mb-1">
                No draft magazines
              </p>
              <p className="text-dark-gray text-sm mb-4">
                Create a new magazine to get started
              </p>
              <Link href="/admin/compile">
                <Button
                  variant="primary"
                  icon={<BookOpen className="h-4 w-4" />}
                >
                  Create Magazine
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function AdminMagazinesPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN', 'MODERATOR']}>
      <AdminMagazinesContent />
    </ProtectedRoute>
  );
}
