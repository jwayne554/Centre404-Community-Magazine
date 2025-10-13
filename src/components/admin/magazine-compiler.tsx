'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Save,
  Globe,
  Lock,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2
} from 'lucide-react';

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

export function MagazineCompiler() {
  const [approvedSubmissions, setApprovedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Submission[]>([]);
  const [magazineTitle, setMagazineTitle] = useState('');
  const [magazineDescription, setMagazineDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    if (!magazineTitle || selectedSubmissions.length === 0) {
      alert('Please add a title and select at least one submission');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/magazines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // You'll need to implement token storage
        },
        body: JSON.stringify({
          title: magazineTitle,
          description: magazineDescription,
          submissionIds: selectedSubmissions.map(s => s.id),
          isPublic,
        }),
      });

      if (response.ok) {
        await response.json();
        alert(`Magazine created successfully! ${isPublic ? 'It is now live.' : 'It is saved as draft.'}`);

        // Reset form
        setMagazineTitle('');
        setMagazineDescription('');
        setSelectedSubmissions([]);
        setIsPublic(false);
      } else {
        throw new Error('Failed to create magazine');
      }
    } catch (error) {
      console.error('Error creating magazine:', error);
      alert('Failed to create magazine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'MY_NEWS':
        return { emoji: '📰', label: 'My News' };
      case 'SAYING_HELLO':
        return { emoji: '👋', label: 'Saying Hello' };
      case 'MY_SAY':
        return { emoji: '💬', label: 'My Say' };
      default:
        return { emoji: '📝', label: 'Story' };
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Available Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Submissions</CardTitle>
          <CardDescription>
            Click to add approved submissions to the magazine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading submissions...</p>
            </div>
          ) : approvedSubmissions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No approved submissions available
            </p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {approvedSubmissions.map((submission) => {
                const categoryInfo = getCategoryInfo(submission.category);
                const isSelected = selectedSubmissions.find(s => s.id === submission.id);
                
                return (
                  <div
                    key={submission.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-accent ${
                      isSelected ? 'opacity-50 bg-muted' : ''
                    }`}
                    onClick={() => !isSelected && addToMagazine(submission)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{categoryInfo.emoji}</span>
                          <span className="font-medium">
                            {submission.user?.name || 'Anonymous'}
                          </span>
                          {isSelected && (
                            <Badge variant="secondary" className="ml-2">
                              Added
                            </Badge>
                          )}
                        </div>
                        {submission.textContent && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {submission.textContent}
                          </p>
                        )}
                      </div>
                      {!isSelected && (
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Magazine Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Magazine Builder</CardTitle>
          <CardDescription>
            Arrange and compile selected submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Magazine Details */}
          <div>
            <label className="text-sm font-medium mb-1 block">Magazine Title</label>
            <input
              type="text"
              value={magazineTitle}
              onChange={(e) => setMagazineTitle(e.target.value)}
              placeholder="Enter magazine title..."
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Description (optional)</label>
            <textarea
              value={magazineDescription}
              onChange={(e) => setMagazineDescription(e.target.value)}
              placeholder="Add a description..."
              className="w-full p-2 border rounded-lg resize-none h-20"
            />
          </div>

          {/* Selected Submissions */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selected Submissions ({selectedSubmissions.length})
            </label>
            {selectedSubmissions.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                Select submissions from the left panel
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedSubmissions.map((submission, index) => {
                  const categoryInfo = getCategoryInfo(submission.category);
                  
                  return (
                    <div
                      key={submission.id}
                      className="p-3 border rounded-lg bg-accent/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-sm">#{index + 1}</span>
                          <span>{categoryInfo.emoji}</span>
                          <span className="text-sm">
                            {submission.user?.name || 'Anonymous'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveDown(index)}
                            disabled={index === selectedSubmissions.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromMagazine(submission.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Publish Options */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant={isPublic ? 'default' : 'outline'}
              onClick={() => setIsPublic(true)}
              className="flex-1"
            >
              <Globe className="mr-2 h-4 w-4" />
              Public
            </Button>
            <Button
              variant={!isPublic ? 'default' : 'outline'}
              onClick={() => setIsPublic(false)}
              className="flex-1"
            >
              <Lock className="mr-2 h-4 w-4" />
              Draft
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={saveMagazine}
              disabled={saving || !magazineTitle || selectedSubmissions.length === 0}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Magazine
                </>
              )}
            </Button>
            <Button variant="outline" disabled>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}