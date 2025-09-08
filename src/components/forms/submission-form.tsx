'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Mic, Image, Palette, Type } from 'lucide-react';

const submissionSchema = z.object({
  category: z.enum(['MY_NEWS', 'SAYING_HELLO', 'MY_SAY']),
  textContent: z.string().min(1, 'Please add some content').max(5000),
  accessibilityText: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

const categories = [
  { value: 'MY_NEWS', label: 'My News', icon: '📰', description: 'Share your updates' },
  { value: 'SAYING_HELLO', label: 'Saying Hello', icon: '👋', description: 'Connect with friends' },
  { value: 'MY_SAY', label: 'My Say', icon: '💬', description: 'Share your thoughts' },
] as const;

const symbols = ['😊', '❤️', '👍', '🎉', '🌟', '☀️', '🌈', '🎵', '🏠', '🚗', '🍕', '⚽'];

export function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  const textContent = watch('textContent');
  const selectedCategory = watch('category');

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          contentType: 'TEXT',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSuccessMessage('Thank you! Your contribution has been submitted.');
      reset();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSymbol = (symbol: string) => {
    const currentText = textContent || '';
    setValue('textContent', currentText + symbol + ' ');
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    
    if (!isRecording) {
      recognition.start();
      setIsRecording(true);
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const currentText = textContent || '';
          setValue('textContent', currentText + finalTranscript + ' ');
        }
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Share Your Story</CardTitle>
        <CardDescription>
          Choose a category and share your message with the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg animate-in">
            ✓ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="text-lg font-semibold mb-3 block">
              Choose a category:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 text-center
                    transition-all hover:bg-accent
                    ${selectedCategory === category.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border'
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={category.value}
                    {...register('category')}
                    className="sr-only"
                  />
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-semibold">{category.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </div>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-destructive text-sm mt-2">{errors.category.message}</p>
            )}
          </div>

          {/* Text Content */}
          <div>
            <label htmlFor="textContent" className="text-lg font-semibold mb-3 block">
              Write your message:
            </label>
            <textarea
              id="textContent"
              {...register('textContent')}
              placeholder="Type your message here..."
              className="w-full min-h-[150px] p-4 text-lg border-2 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={5000}
            />
            {errors.textContent && (
              <p className="text-destructive text-sm mt-2">{errors.textContent.message}</p>
            )}
            
            <div className="text-sm text-muted-foreground mt-2">
              {textContent?.length || 0} / 5000 characters
            </div>

            {/* Input Tools */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={startSpeechRecognition}
                className={isRecording ? 'bg-destructive text-white' : ''}
              >
                <Mic className="mr-2 h-4 w-4" />
                {isRecording ? 'Stop' : 'Speak'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSymbols(!showSymbols)}
              >
                😊 Symbols
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue('textContent', '')}
              >
                🗑️ Clear
              </Button>
            </div>

            {/* Symbol Board */}
            {showSymbols && (
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mt-4 p-4 bg-muted rounded-lg">
                {symbols.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => addSymbol(symbol)}
                    className="p-3 text-2xl hover:bg-background rounded transition-colors"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alt Text for Accessibility */}
          <div>
            <label htmlFor="accessibilityText" className="text-lg font-semibold mb-3 block">
              Add description for screen readers (optional):
            </label>
            <input
              id="accessibilityText"
              type="text"
              {...register('accessibilityText')}
              placeholder="Describe your content for people using screen readers"
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit My Contribution
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}