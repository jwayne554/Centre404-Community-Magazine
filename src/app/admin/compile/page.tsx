'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoryEmoji, getCategoryColor, getCategoryLabel } from '@/utils/category-helpers';
import Layout from '@/components/ui/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Plus, Save, Globe, ArrowUp, ArrowDown, X, Loader2 } from 'lucide-react';

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
      const response = await fetch('/api/submissions?status=APPROVED', {
        credentials: 'include',
      });
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
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          submissionIds: selectedSubmissions.map(s => s.id),
          isPublic: publishNow,
        }),
      });

      if (response.ok) {
        alert(`Magazine ${publishNow ? 'published' : 'saved as draft'} successfully!`);
        router.push(publishNow ? '/magazines' : '/admin');
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
    <Layout>
      {/* Hero Header */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-primary mb-8">
        <div className="p-8">
          <Button
            variant="secondary"
            onClick={() => router.push('/admin')}
            icon={<ArrowLeft className="h-4 w-4" />}
            className="mb-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Back to Dashboard
          </Button>

          <div className="text-5xl mb-3">📖</div>
          <h1 className="text-3xl font-bold mb-2">Compile Magazine Edition</h1>
          <p className="text-white/95 text-lg">
            Select and arrange approved submissions to create a beautiful magazine
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
              Give your magazine a title and description
            </p>
          </div>

          <div className="space-y-5">
            {/* Title Input */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[300px]">
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
              <Button
                variant="outline"
                onClick={generateSuggestedTitle}
                className="self-end"
              >
                ✨ Suggest Title
              </Button>
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

            {/* Publish Now Checkbox */}
            <label className="flex items-center gap-3 p-4 bg-primary/10 border-2 border-primary rounded-xl cursor-pointer font-semibold hover:bg-primary/20 transition-colors">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-primary"
              />
              🌐 Publish immediately (make visible to all users)
            </label>
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
              Approved submissions ready to be added
            </p>
          </div>

          <div className="p-6 flex-1">
            {loading ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">⏳</div>
                <p className="text-dark-gray">Loading submissions...</p>
              </div>
            ) : availableSubmissions.length === 0 ? (
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
              📖 Selected for Edition ({selectedSubmissions.length})
            </h2>
            <p className="text-dark-gray text-sm">
              Arrange these in the order they'll appear
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
              Ready to {publishNow ? 'Publish' : 'Save'}? 🚀
            </div>
            <div className="text-sm text-dark-gray">
              {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} selected
              {publishNow && ' • Will be visible to all users immediately'}
              {!publishNow && ' • Can be published later from the archive'}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveMagazine}
              disabled={saving || !title.trim() || selectedSubmissions.length === 0}
              icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : publishNow ? <Globe className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              className={publishNow ? 'bg-primary hover:bg-primary/90' : 'bg-charcoal hover:bg-charcoal/90'}
            >
              {saving ? (
                publishNow ? 'Publishing...' : 'Saving...'
              ) : publishNow ? (
                'Publish Magazine'
              ) : (
                'Save as Draft'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
}
