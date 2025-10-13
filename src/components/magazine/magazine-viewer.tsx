'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, Volume2, Filter, RefreshCw } from 'lucide-react';

interface Submission {
  id: string;
  category: string;
  contentType: string;
  textContent: string | null;
  mediaUrl: string | null;
  accessibilityText: string | null;
  submittedAt: string;
  user: {
    id: string;
    name: string;
  } | null;
}

export function MagazineViewer() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchApprovedSubmissions = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const response = await fetch(`/api/submissions?status=APPROVED${categoryParam}`);
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'MY_NEWS':
        return { emoji: '📰', label: 'My News', color: 'bg-blue-100 text-blue-800' };
      case 'SAYING_HELLO':
        return { emoji: '👋', label: 'Saying Hello', color: 'bg-green-100 text-green-800' };
      case 'MY_SAY':
        return { emoji: '💬', label: 'My Say', color: 'bg-purple-100 text-purple-800' };
      default:
        return { emoji: '📝', label: 'Story', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const speakText = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      if (currentlySpeaking === id) {
        setCurrentlySpeaking(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setCurrentlySpeaking(null);
      };
      
      setCurrentlySpeaking(id);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const shareSubmission = async (submission: Submission) => {
    const shareData = {
      title: `${getCategoryInfo(submission.category).label} from Centre404 Magazine`,
      text: submission.textContent || 'Check out this story from our community magazine!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );
        alert('Story link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          size="lg"
        >
          <Filter className="mr-2 h-4 w-4" />
          All Stories
        </Button>
        <Button
          variant={selectedCategory === 'MY_NEWS' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('MY_NEWS')}
          size="lg"
        >
          📰 My News
        </Button>
        <Button
          variant={selectedCategory === 'SAYING_HELLO' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('SAYING_HELLO')}
          size="lg"
        >
          👋 Saying Hello
        </Button>
        <Button
          variant={selectedCategory === 'MY_SAY' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('MY_SAY')}
          size="lg"
        >
          💬 My Say
        </Button>
      </div>

      {/* Submissions Grid */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-2">
              No stories in this category yet
            </p>
            <p className="text-muted-foreground">
              Check back soon or contribute your own story!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => {
            const categoryInfo = getCategoryInfo(submission.category);
            const isCurrentlySpeaking = currentlySpeaking === submission.id;
            
            return (
              <Card 
                key={submission.id} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={categoryInfo.color}>
                      <span className="mr-1">{categoryInfo.emoji}</span>
                      {categoryInfo.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(submission.submittedAt)}
                    </span>
                  </div>
                  <CardTitle className="text-lg">
                    {submission.user?.name || 'Community Member'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.mediaUrl && (
                    <img 
                      src={submission.mediaUrl} 
                      alt={submission.accessibilityText || 'User submitted image'}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  {submission.textContent && (
                    <p className="text-base leading-relaxed mb-4 whitespace-pre-wrap">
                      {submission.textContent}
                    </p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // In a real app, this would update the database
                        alert('Liked!');
                      }}
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      Like
                    </Button>
                    
                    {submission.textContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 ${isCurrentlySpeaking ? 'bg-primary/10' : ''}`}
                        onClick={() => speakText(submission.textContent!, submission.id)}
                      >
                        <Volume2 className={`mr-1 h-4 w-4 ${isCurrentlySpeaking ? 'animate-pulse' : ''}`} />
                        {isCurrentlySpeaking ? 'Stop' : 'Listen'}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => shareSubmission(submission)}
                    >
                      <Share2 className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}