'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  Sparkles,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
      const response = await fetch('/api/submissions?status=APPROVED');
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
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          submissionIds: selectedSubmissions.map(s => s.id),
          isPublic: publishNow,
        }),
      });

      if (response.ok) {
        const magazine = await response.json();
        alert(`Magazine ${publishNow ? 'published' : 'saved as draft'} successfully!`);
        router.push('/magazines');
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

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'MY_NEWS': return '📰';
      case 'SAYING_HELLO': return '👋';
      case 'MY_SAY': return '💬';
      default: return '📝';
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Compile Magazine Edition</h1>
          <p className="text-muted-foreground">
            Select and arrange approved submissions to create a new magazine edition
          </p>
        </div>

        {/* Magazine Metadata */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Magazine Information
            </CardTitle>
            <CardDescription>Give your magazine a title and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Spring 2025 Edition, Issue #5"
                  className="w-full p-3 border rounded-lg"
                  maxLength={255}
                />
              </div>
              <Button
                variant="outline"
                onClick={generateSuggestedTitle}
                className="self-end"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Suggest
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional: Brief description of this edition"
                className="w-full p-3 border rounded-lg min-h-[80px]"
                maxLength={500}
              />
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="publishNow"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="publishNow" className="text-sm font-medium cursor-pointer">
                Publish immediately (make visible to all users)
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Available Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>
                Available Submissions ({availableSubmissions.length})
              </CardTitle>
              <CardDescription>
                Approved submissions ready to be added to the magazine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p>Loading submissions...</p>
                </div>
              ) : availableSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No available submissions</p>
                  <p className="text-sm">
                    {selectedSubmissions.length > 0
                      ? 'All approved submissions have been added!'
                      : 'No approved submissions yet. Go to the dashboard to approve some!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {availableSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">
                          {getCategoryEmoji(submission.category)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">
                            {submission.category.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By {submission.user?.name || submission.userName || 'Anonymous'}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToMagazine(submission)}
                          className="gap-1 shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                      {submission.textContent && (
                        <p className="text-sm line-clamp-2 text-muted-foreground">
                          {submission.textContent}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected for Magazine */}
          <Card>
            <CardHeader>
              <CardTitle>
                Selected for Edition ({selectedSubmissions.length})
              </CardTitle>
              <CardDescription>
                Arrange these submissions in the order they&apos;ll appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No submissions selected</p>
                  <p className="text-sm">
                    Click &quot;Add&quot; on submissions from the left to include them
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {selectedSubmissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4 bg-accent/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveDown(index)}
                            disabled={index === selectedSubmissions.length - 1}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {getCategoryEmoji(submission.category)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <div className="font-semibold text-sm">
                              {submission.category.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            By {submission.user?.name || submission.userName || 'Anonymous'}
                          </div>
                          {submission.textContent && (
                            <p className="text-xs line-clamp-2 text-muted-foreground">
                              {submission.textContent}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromMagazine(submission.id)}
                          className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex items-center justify-between p-6 bg-accent rounded-lg border-2 border-primary/20">
          <div>
            <div className="font-semibold mb-1">
              Ready to {publishNow ? 'publish' : 'save'}?
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} selected
              {publishNow && ' • Will be visible to all users immediately'}
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
              size="lg"
              onClick={saveMagazine}
              disabled={saving || !title.trim() || selectedSubmissions.length === 0}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {publishNow ? 'Publishing...' : 'Saving...'}
                </>
              ) : publishNow ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Publish Magazine
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save as Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
