'use client';

import { useState, useRef, useEffect } from 'react';
import { getAllCategories, SYMBOL_BOARD, getCategoryLabel, getCategoryEmoji } from '@/utils/category-helpers';
import Button from '@/components/ui/Button';
import Card, { CategoryCard } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import Accordion from '@/components/ui/Accordion';
import { useToast } from '@/components/ui/Toast';
import { Newspaper, Hand, MessageCircle, Mic, Smile, Trash2, Palette, Undo2, Eye, X, Edit3 } from 'lucide-react';

// Task 2.5: Use shared constants (eliminates duplication across forms)
const categories = getAllCategories();
const symbols = SYMBOL_BOARD;

// Category icons mapping
const categoryIcons = {
  MY_NEWS: <Newspaper className="h-6 w-6" />,
  SAYING_HELLO: <Hand className="h-6 w-6" />,
  MY_SAY: <MessageCircle className="h-6 w-6" />,
};

interface SimpleSubmissionFormProps {
  preselectedCategory?: string;
}

export function SimpleSubmissionForm({ preselectedCategory }: SimpleSubmissionFormProps = {}) {
  const toast = useToast();
  const [category, setCategory] = useState(preselectedCategory || '');
  const [textContent, setTextContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showSymbols, setShowSymbols] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');  // For preview display only
  const [imageFile, setImageFile] = useState<File | null>(null);  // Actual file for upload
  const [accessibilityText, setAccessibilityText] = useState('');  // Alt text for images/drawings
  const [isDragging, setIsDragging] = useState(false);  // Drag state for image upload
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Preview modal state (P2-3)
  const [showPreview, setShowPreview] = useState(false);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [drawingData, setDrawingData] = useState('');
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Top of form ref for scrolling
  const formTopRef = useRef<HTMLDivElement>(null);

  // Draft state
  const [_hasSavedDraft, setHasSavedDraft] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Session ID for tracking submissions
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Generate or retrieve sessionId on mount
  useEffect(() => {
    try {
      let id = localStorage.getItem('sessionId');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('sessionId', id);
      }
      setSessionId(id);
    } catch {
      // localStorage not available, generate in-memory sessionId
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`);
    }
  }, []);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Field validation function
  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'textContent':
        if (value.length > 5000) {
          error = `Maximum 5000 characters (currently ${value.length})`;
        }
        break;
      case 'authorName':
        if (value.length > 100) {
          error = 'Maximum 100 characters';
        }
        break;
      case 'accessibilityText':
        if (value.length > 500) {
          error = 'Maximum 500 characters';
        }
        break;
    }

    setErrors(prev => {
      if (error) {
        return { ...prev, [name]: error };
      }
      // Remove error if valid
      const { [name]: _, ...rest } = prev;
      return rest;
    });

    return !error;
  };

  // Clear error when field changes
  const clearError = (name: string) => {
    setErrors(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  };

  // Auto-save form drafts to localStorage
  useEffect(() => {
    // Skip saving if form is empty or just submitted
    if (!category && !textContent && !authorName) return;
    if (successMessage) return;

    const draft = {
      category,
      textContent,
      authorName,
      accessibilityText,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('submissionDraft', JSON.stringify(draft));
    } catch (e) {
      // localStorage might be unavailable
      console.warn('Could not save draft:', e);
    }
  }, [category, textContent, authorName, accessibilityText, successMessage]);

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('submissionDraft');
      if (saved) {
        const draft = JSON.parse(saved);
        // Only show prompt if draft has meaningful content
        if (draft.textContent || draft.authorName) {
          setHasSavedDraft(true);
          setShowDraftPrompt(true);
        }
      }
    } catch (e) {
      // localStorage might be unavailable
      console.warn('Could not load draft:', e);
    }
  }, []);

  // Restore draft function
  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem('submissionDraft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.category) setCategory(draft.category);
        if (draft.textContent) setTextContent(draft.textContent);
        if (draft.authorName) setAuthorName(draft.authorName);
        if (draft.accessibilityText) setAccessibilityText(draft.accessibilityText);
        toast.success('Draft restored!');
      }
    } catch {
      toast.error('Could not restore draft');
    }
    setShowDraftPrompt(false);
  };

  // Discard draft function
  const discardDraft = () => {
    try {
      localStorage.removeItem('submissionDraft');
    } catch {
      // Ignore errors
    }
    setHasSavedDraft(false);
    setShowDraftPrompt(false);
  };

  // Clear draft after successful submission
  const clearDraft = () => {
    try {
      localStorage.removeItem('submissionDraft');
    } catch {
      // Ignore errors
    }
    setHasSavedDraft(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || (!textContent && !imageFile && !drawingData && !audioBlob)) {
      toast.error('Please choose a category and add some content (text, image, audio, or drawing)');
      return;
    }

    // Step 1: Show loading state
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Upload audio if present
      let audioMediaUrl = null;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload audio');
        }

        const uploadData = await uploadResponse.json();
        audioMediaUrl = uploadData.url;
      }

      // Upload image if present (using file upload instead of base64)
      let imageMediaUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageMediaUrl = uploadData.url;
      }

      // Determine content type based on what's provided
      let contentType = 'TEXT';
      if (audioMediaUrl && textContent) contentType = 'MIXED';
      else if (audioMediaUrl) contentType = 'AUDIO';
      else if (imageMediaUrl && textContent) contentType = 'MIXED';
      else if (imageMediaUrl) contentType = 'IMAGE';
      else if (drawingData && textContent) contentType = 'MIXED';
      else if (drawingData) contentType = 'DRAWING';

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          textContent: textContent || '',
          contentType,
          mediaUrl: audioMediaUrl || imageMediaUrl || null,
          drawingData: drawingData || null,
          accessibilityText: accessibilityText || null,
          userName: authorName || 'Community Member',
          sessionId: sessionId || null,
        }),
      });

      if (response.ok) {
        // Step 2: Show success animation on button
        setSubmitSuccess(true);

        // Step 3: Show toast notification
        toast.success('Your contribution has been submitted for review.');

        // Step 4: Set success message for banner
        setSuccessMessage('✓ Thank you! Your contribution is being reviewed by our team. You\'ll see it in the next magazine edition once approved!');

        // Step 5: Clear form and draft
        setCategory('');
        setTextContent('');
        setAuthorName('');
        setImagePreview('');
        setImageFile(null);
        setAccessibilityText('');
        setDrawingData('');
        setAudioBlob(null);
        setAudioUrl(null);
        clearDraft();

        // Clear canvas if it exists
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        // Step 6: Smooth scroll to top after brief delay
        setTimeout(() => {
          formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        // Reset success states after delay
        setTimeout(() => {
          setSuccessMessage('');
          setSubmitSuccess(false);
        }, 10000);
      } else {
        const errorData = await response.text();
        console.error('Submission failed:', response.status, errorData);
        toast.error(`Submission failed: ${response.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset form and hide success message
  const handleSubmitAnother = () => {
    setSuccessMessage('');
    setSubmitSuccess(false);
  };

  const startAudioRecording = async () => {
    // If already recording, stop it
    if (audioRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        setAudioRecording(false);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setAudioRecording(true);
      console.log('Audio recording started');
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      toast.error('Failed to start audio recording. Please allow microphone access.');
      setAudioRecording(false);
    }
  };

  // Process image file (used by both click and drag)
  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image file is too large. Please select an image under 5MB.');
      return;
    }

    // Store the actual file for upload
    setImageFile(file);

    // Create preview URL for display only
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drawing functions - responsive canvas sizing
  useEffect(() => {
    if (showDrawing && canvasRef.current && canvasContainerRef.current) {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;

      // Calculate responsive size based on container width
      const maxWidth = Math.min(container.offsetWidth - 16, 600); // 16px for padding
      const height = Math.round(maxWidth * 0.67); // 3:2 aspect ratio

      canvas.width = maxWidth;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showDrawing]);

  // Cleanup blob URLs to prevent memory leaks (Task 4.4)
  useEffect(() => {
    return () => {
      // Revoke blob URLs when component unmounts
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (drawingData && drawingData.startsWith('blob:')) {
        URL.revokeObjectURL(drawingData);
      }
    };
  }, [audioUrl, imagePreview, drawingData]);

  // Save canvas state for undo
  const saveToUndo = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setUndoStack(prev => [...prev.slice(-10), imageData]); // Keep last 10 states
    }
  };

  // Undo last drawing action
  const undoDrawing = () => {
    if (undoStack.length === 0 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx && undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      ctx.putImageData(lastState, 0, 0);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    // Save current state for undo before drawing
    saveToUndo();

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x, y;
    if ('touches' in e) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = currentColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x, y;
    if ('touches' in e) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawing = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    setDrawingData(dataUrl);
    setImagePreview(dataUrl);
    toast.success('Drawing saved! It will be included with your submission.');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Scroll target ref */}
      <div ref={formTopRef} className="absolute -top-5" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
        <p className="text-dark-gray">
          Contribute to our community magazine by sharing your news, thoughts, or just saying hello!
        </p>
      </div>

      {/* Accordion: How does this work? */}
      <Accordion title="How does this work?">
        <p className="mb-2">
          The Centre404 Community Magazine is a platform for our community members to share their stories, news, and thoughts.
        </p>
        <p className="mb-2">
          Your contribution will be reviewed and may be featured in our next edition. You can include text, photos, audio, or even drawings!
        </p>
        <p>
          Select a category, fill out the form, and hit submit. It&apos;s that easy!
        </p>
      </Accordion>

      {/* Enhanced Success Banner */}
      {successMessage && (
        <Card className="mb-8 bg-gradient-to-br from-primary to-primary/90 text-white border-primary shadow-lg">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✓</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  Contribution Submitted Successfully!
                </h3>
                <p className="mb-2 opacity-95">
                  Thank you! Your contribution is being reviewed by our team.
                </p>
                <p className="mb-4 text-sm opacity-90">
                  ⏱️ Submissions are typically reviewed within 24-48 hours. You&apos;ll see yours in the next magazine edition once approved!
                </p>
                <Button
                  variant="secondary"
                  onClick={handleSubmitAnother}
                  className="bg-white text-primary hover:bg-background"
                >
                  ✏️ Submit Another Contribution
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Draft Restore Prompt */}
      {showDraftPrompt && !successMessage && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-1">
                  Resume your draft?
                </h3>
                <p className="text-sm text-dark-gray mb-3">
                  You have an unsaved draft from your last visit.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={restoreDraft}
                  >
                    Restore Draft
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={discardDraft}
                  >
                    Start Fresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        {/* Category Selection with CategoryCard - Only show if not preselected */}
        {!preselectedCategory && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Select a category for your contribution
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.value}
                  title={cat.label}
                  icon={categoryIcons[cat.value as keyof typeof categoryIcons]}
                  active={category === cat.value}
                  onClick={() => setCategory(cat.value)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Author Name - Optional field */}
        {category && (
          <>
            <Input
              label="Your name"
              id="authorName"
              value={authorName}
              onChange={(e) => {
                setAuthorName(e.target.value);
                if (errors.authorName) clearError('authorName');
              }}
              onBlur={() => validateField('authorName', authorName)}
              placeholder="Enter your name (optional)"
              error={errors.authorName}
            />
            <p className="text-sm text-dark-gray -mt-3 mb-4">
              If left blank, your post will show as &quot;Community Member&quot;
            </p>
          </>
        )}

        {/* Text Content with Toolbar */}
        {category && (
          <div className="mb-4">
            <TextArea
              label="Write your message"
              id="message"
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                if (errors.textContent) clearError('textContent');
              }}
              onBlur={() => validateField('textContent', textContent)}
              placeholder="Share your story, news, or just say hello..."
              rows={6}
              error={errors.textContent}
            />
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${textContent.length > 5000 ? 'text-red-500 font-medium' : 'text-dark-gray'}`}>
                {textContent.length} / 5000 characters
              </span>
            </div>

            {/* Input Tools */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant={audioRecording ? 'secondary' : 'icon'}
                onClick={startAudioRecording}
                icon={<Mic className="h-5 w-5" />}
                className={audioRecording ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
              >
                {audioRecording ? 'Stop Recording' : 'Record Audio'}
              </Button>
              <Button
                type="button"
                variant="icon"
                onClick={() => setShowSymbols(!showSymbols)}
                icon={<Smile className="h-5 w-5" />}
              >
                Symbols
              </Button>
              <Button
                type="button"
                variant="icon"
                onClick={() => setTextContent('')}
                icon={<Trash2 className="h-5 w-5" />}
              >
                Clear
              </Button>
            </div>

            {/* Audio Preview */}
            {audioUrl && (
              <Card className="mt-4 bg-primary/5 border-primary">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-primary flex items-center gap-2">
                      <Mic className="h-5 w-5" /> Audio Recorded
                    </span>
                    <Button
                      type="button"
                      variant="icon"
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                        if (audioUrl) URL.revokeObjectURL(audioUrl);
                      }}
                      icon={<Trash2 className="h-4 w-4" />}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    />
                  </div>
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full rounded"
                  />
                  <p className="text-sm text-dark-gray text-center mt-2">
                    This audio will be included with your submission
                  </p>
                </div>
              </Card>
            )}

            {/* Symbol Board */}
            {showSymbols && (
              <Card className="mt-3 p-2">
                <p className="sr-only">Symbol board - select a symbol to insert into your message</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" role="group" aria-label="Symbol board">
                  {symbols.map(({ symbol, label }) => (
                    <button
                      key={symbol}
                      type="button"
                      className="h-10 w-10 flex items-center justify-center text-xl rounded hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      onClick={() => {
                        setTextContent(prev => prev + symbol + ' ');
                        setShowSymbols(false);
                      }}
                      aria-label={`Insert ${label} symbol`}
                    >
                      <span aria-hidden="true">{symbol}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Image Upload - Note: Using custom implementation to maintain existing functionality */}
        {category && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Add a photo (optional)
              <span className="ml-2 text-xs font-normal text-dark-gray bg-background px-2 py-0.5 rounded-full">
                Max 5MB
              </span>
            </label>
            <div
              onClick={() => document.getElementById('imageInput')?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : 'border-light-gray bg-background hover:border-primary hover:bg-primary/5'
              }`}
            >
              <p className="text-dark-gray mb-2">
                {isDragging ? '📥 Drop your image here!' : '📷 Click to add a photo'}
              </p>
              <p className="text-sm text-dark-gray/70">or drag and drop here</p>
              <p className="text-sm text-dark-gray/70 mt-1">JPG, PNG or GIF</p>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt={`Preview of your uploaded image for ${category ? getCategoryLabel(category) : 'submission'}`}
                  className="max-w-full rounded-xl shadow-card"
                />
                {/* Accessibility text input for images */}
                <div className="mt-3">
                  <label htmlFor="imageAltText" className="block text-sm font-medium mb-1">
                    Describe your image (helps visually impaired readers)
                  </label>
                  <textarea
                    id="imageAltText"
                    value={accessibilityText}
                    onChange={(e) => setAccessibilityText(e.target.value)}
                    placeholder="A photo of my garden with blooming red roses and a blue sky..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-light-gray bg-white text-charcoal placeholder:text-dark-gray/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    aria-describedby="imageAltTextHelp"
                  />
                  <p id="imageAltTextHelp" className="text-sm text-dark-gray mt-1">
                    This description will be read aloud by screen readers
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drawing Tool with Green Theme */}
        {category && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Or draw a picture (optional)
            </label>
            <Button
              type="button"
              variant="icon"
              onClick={() => setShowDrawing(!showDrawing)}
              icon={<Palette className="h-5 w-5" />}
            >
              {showDrawing ? 'Close' : 'Open'} Drawing Tool
            </Button>
            {showDrawing && (
              <Card className="mt-3 overflow-hidden">
                <div ref={canvasContainerRef} className="w-full p-2">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="block w-full h-auto bg-white cursor-crosshair touch-none rounded-lg border border-light-gray"
                    role="img"
                    tabIndex={0}
                    aria-label="Drawing canvas. Use mouse or touch to draw. Keyboard users can describe what they would like to illustrate in the text field instead."
                  />
                </div>
                <p className="text-sm text-dark-gray text-center py-2 bg-background/50">
                  Can&apos;t draw? Describe what you&apos;d like to illustrate in the text field above.
                </p>
                <div className="flex gap-2 p-3 bg-background justify-center items-center flex-wrap">
                  {['#000000', '#FF0000', '#34A853', '#0000FF', '#FFBB00'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCurrentColor(color)}
                      className={`w-10 h-10 rounded-full cursor-pointer transition-transform ${
                        currentColor === color ? 'scale-125 ring-2 ring-primary' : 'scale-100'
                      }`}
                      style={{ background: color }}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="icon"
                    onClick={undoDrawing}
                    disabled={undoStack.length === 0}
                    icon={<Undo2 className="h-4 w-4" />}
                    aria-label="Undo last stroke"
                  >
                    Undo
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    onClick={clearCanvas}
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={saveDrawing}
                  >
                    Save Drawing
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Enhanced Submit Button with Loading/Success States */}
        {category && (
          <div className="mt-8 space-y-3">
            {/* P2-3: Preview Button */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowPreview(true)}
              disabled={isSubmitting || (!textContent && !imageFile && !drawingData && !audioBlob)}
              icon={<Eye className="h-5 w-5" />}
              className="w-full"
            >
              Preview Before Submitting
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full relative transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : submitSuccess ? (
                <>
                  <span className="inline-block text-2xl mr-2">✓</span>
                  Submitted Successfully!
                </>
              ) : (
                '✓ Submit My Contribution'
              )}
            </Button>
          </div>
        )}
      </form>

      {/* P2-3: Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}
        >
          <div className="bg-white rounded-xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-light-gray flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 id="preview-title" className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Preview Your Submission
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-dark-gray hover:text-charcoal p-2 rounded-lg"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview Content - Magazine Style */}
            <div className="p-4 sm:p-6">
              <div className="border border-light-gray rounded-xl overflow-hidden">
                <div className="p-6">
                  {/* Category and Author */}
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">{getCategoryEmoji(category)}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium mr-3">
                      {getCategoryLabel(category)}
                    </span>
                    <span className="text-dark-gray text-sm">
                      By {authorName || 'Community Member'}
                    </span>
                  </div>

                  {/* Text Content */}
                  {textContent && (
                    <p className="mb-4 whitespace-pre-wrap">{textContent}</p>
                  )}

                  {/* Image Preview */}
                  {imagePreview && !drawingData && (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt={accessibilityText || 'Your uploaded image'}
                        className="w-full h-auto rounded-lg border border-light-gray max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Drawing Preview */}
                  {drawingData && (
                    <div className="mb-4">
                      <img
                        src={drawingData}
                        alt={accessibilityText || 'Your drawing'}
                        className="max-w-full h-auto rounded-lg border border-light-gray"
                      />
                    </div>
                  )}

                  {/* Audio Preview */}
                  {audioUrl && (
                    <div className="mb-4 bg-background p-4 rounded-lg border border-light-gray">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-dark-gray">Audio Recording</span>
                      </div>
                      <audio controls src={audioUrl} className="w-full" />
                    </div>
                  )}

                  {/* Placeholder Like Button */}
                  <div className="flex items-center gap-2 pt-2 border-t border-light-gray mt-4">
                    <span className="text-dark-gray text-sm flex items-center gap-1">
                      <span>❤️</span> 0 likes
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-dark-gray text-center mt-4">
                This is how your submission will appear in the magazine once approved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-6 border-t border-light-gray bg-background flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                icon={<Edit3 className="h-4 w-4" />}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowPreview(false);
                  // Trigger form submission
                  const form = document.querySelector('form');
                  if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                }}
                className="flex-1"
              >
                Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}