'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoryEmoji, getCategoryColor, getCategoryLabel } from '@/utils/category-helpers';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Layout from '@/components/ui/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Plus, Save, ArrowUp, ArrowDown, X, Loader2, RefreshCw } from 'lucide-react';

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

interface MagazineItem {
  id: string;
  submission: Submission;
}

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  status: string;
  items: MagazineItem[];
}

function MagazineEditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [approvedSubmissions, setApprovedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Magazine metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchMagazineAndSubmissions();
  }, [id]);

  const fetchMagazineAndSubmissions = async () => {
    setLoading(true);
    try {
      // Fetch magazine details
      const magResponse = await fetch(`/api/magazines/${id}`, {
        credentials: 'include',
      });

      if (!magResponse.ok) {
        toast.error('Magazine not found');
        router.push('/admin/magazines');
        return;
      }

      const magData = await magResponse.json();

      // Check if it's a draft
      if (magData.status !== 'DRAFT') {
        toast.error('Only draft magazines can be edited');
        router.push('/admin/magazines');
        return;
      }

      setMagazine(magData);
      setTitle(magData.title);
      setDescription(magData.description || '');

      // Extract current submissions from magazine items
      const currentSubmissions = magData.items.map((item: MagazineItem) => item.submission);
      setSelectedSubmissions(currentSubmissions);

      // Fetch all approved submissions
      const subResponse = await fetch('/api/submissions?status=APPROVED', {
        credentials: 'include',
      });
      const subData = await subResponse.json();
      setApprovedSubmissions(subData.submissions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load magazine data');
    } finally {
      setLoading(false);
    }
  };

  const addToMagazine = (submission: Submission) => {
    if (!selectedSubmissions.find(s => s.id === submission.id)) {
      setSelectedSubmissions([...selectedSubmissions, submission]);
    }
  };

  const removeFromMagazine = (submissionId: string) => {
    setSelectedSubmissions(selectedSubmissions.filter(s => s.id !== submissionId));
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
      toast.error('Please add a magazine title');
      return;
    }

    if (selectedSubmissions.length === 0) {
      toast.error('Please add at least one submission to the magazine');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          submissionIds: selectedSubmissions.map(s => s.id),
        }),
      });

      if (response.ok) {
        toast.success('Magazine updated successfully!');
        router.push('/admin/magazines');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update magazine');
      }
    } catch (error) {
      console.error('Failed to update magazine:', error);
      toast.error(`Failed to update magazine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const availableSubmissions = approvedSubmissions.filter(
    as => !selectedSubmissions.find(ss => ss.id === as.id)
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-3 text-dark-gray">Loading magazine...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Header */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-primary mb-8">
        <div className="p-8">
          <Button
            variant="secondary"
            onClick={() => router.push('/admin/magazines')}
            icon={<ArrowLeft className="h-4 w-4" />}
            className="mb-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Back to Magazines
          </Button>

          <div className="text-5xl mb-3">✏️</div>
          <h1 className="text-3xl font-bold mb-2">Edit Magazine Draft</h1>
          <p className="text-white/95 text-lg">
            Update the title, description, or reorder submissions
          </p>
        </div>
      </Card>

      {/* Magazine Information */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              ✨ Magazine Information
            </h2>
            <p className="text-dark-gray text-sm">
              Update the magazine title and description
            </p>
          </div>

          <div className="space-y-5">
            {/* Title Input */}
            <div>
              <label className="block font-semibold mb-2 text-sm">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Spring 2025 Edition, Issue #5"
                maxLength={255}
                className="w-full px-4 py-3 text-base border-2 border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block font-semibold mb-2 text-sm">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this edition"
                maxLength={500}
                className="w-full px-4 py-3 text-base border-2 border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors resize-vertical min-h-[90px]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Available Submissions */}
        <Card className="flex flex-col">
          <div className="p-6 pb-4 border-b-2 border-light-gray">
            <h2 className="text-lg font-bold mb-1">
              📚 Available Submissions ({availableSubmissions.length})
            </h2>
            <p className="text-dark-gray text-sm">
              Approved submissions that can be added
            </p>
          </div>

          <div className="p-6 flex-1">
            {availableSubmissions.length === 0 ? (
              <div className="text-center py-16 bg-background rounded-xl">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-lg font-semibold mb-2">
                  {selectedSubmissions.length > 0 ? 'All Added!' : 'No Submissions'}
                </p>
                <p className="text-dark-gray text-sm">
                  {selectedSubmissions.length > 0
                    ? 'All approved submissions have been added!'
                    : 'No approved submissions yet.'}
                </p>
              </div>
            ) : (
              <div className="max-h-[650px] overflow-y-auto space-y-3">
                {availableSubmissions.map((submission) => {
                  const categoryColor = getCategoryColor(submission.category);

                  return (
                    <div
                      key={submission.id}
                      className="border-2 border-light-gray rounded-xl p-4 hover:bg-background hover:translate-x-1 transition-all"
                      style={{ borderLeft: `5px solid ${categoryColor}` }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">
                          {getCategoryEmoji(submission.category)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold mb-1">
                            {getCategoryLabel(submission.category)}
                          </div>
                          <div className="text-xs text-dark-gray">
                            By {submission.user?.name || submission.userName || 'Anonymous'}
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => addToMagazine(submission)}
                          icon={<Plus className="h-4 w-4" />}
                        >
                          Add
                        </Button>
                      </div>
                      {submission.textContent && (
                        <p className="text-sm leading-relaxed text-dark-gray line-clamp-2">
                          {submission.textContent}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Selected for Magazine */}
        <Card className="flex flex-col border-4 border-accent">
          <div className="p-6 pb-4 border-b-2 border-light-gray">
            <h2 className="text-lg font-bold mb-1">
              📖 In This Edition ({selectedSubmissions.length})
            </h2>
            <p className="text-dark-gray text-sm">
              Drag to reorder or remove submissions
            </p>
          </div>

          <div className="p-6 flex-1">
            {selectedSubmissions.length === 0 ? (
              <div className="text-center py-16 bg-background rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-semibold mb-2">
                  No Submissions Selected
                </p>
                <p className="text-dark-gray text-sm">
                  Click "Add" on submissions from the left to include them
                </p>
              </div>
            ) : (
              <div className="max-h-[650px] overflow-y-auto space-y-3">
                {selectedSubmissions.map((submission, index) => {
                  const categoryColor = getCategoryColor(submission.category);

                  return (
                    <div
                      key={submission.id}
                      className="border-2 border-accent rounded-xl p-4 bg-accent/5"
                      style={{ borderLeft: `5px solid ${categoryColor}` }}
                    >
                      <div className="flex gap-3 items-start">
                        {/* Reorder Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="w-8 h-8 bg-background border-2 border-light-gray rounded-lg flex items-center justify-center text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-light-gray transition-colors"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === selectedSubmissions.length - 1}
                            className="w-8 h-8 bg-background border-2 border-light-gray rounded-lg flex items-center justify-center text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-light-gray transition-colors"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-2xl">
                              {getCategoryEmoji(submission.category)}
                            </span>
                            <span
                              className="text-white px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ backgroundColor: categoryColor }}
                            >
                              #{index + 1}
                            </span>
                            <div className="text-sm font-bold">
                              {getCategoryLabel(submission.category)}
                            </div>
                          </div>
                          <div className="text-xs text-dark-gray mb-2">
                            By {submission.user?.name || submission.userName || 'Anonymous'}
                          </div>
                          {submission.textContent && (
                            <p className="text-xs leading-relaxed text-dark-gray line-clamp-2">
                              {submission.textContent}
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromMagazine(submission.id)}
                          className="w-8 h-8 bg-red-50 border-2 border-red-300 rounded-lg text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <Card className="bg-gradient-to-br from-background to-white border-2 border-light-gray">
        <div className="p-6 flex justify-between items-center flex-wrap gap-5">
          <div>
            <div className="text-lg font-bold mb-1">
              Ready to Save Changes?
            </div>
            <div className="text-sm text-dark-gray">
              {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} in this edition
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/magazines')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveMagazine}
              disabled={saving || !title.trim() || selectedSubmissions.length === 0}
              icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
}

export default function MagazineEditPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute requiredRole={['ADMIN', 'MODERATOR']}>
      <MagazineEditContent params={params} />
    </ProtectedRoute>
  );
}
