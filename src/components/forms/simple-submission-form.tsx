'use client';

import { useState, useRef, useEffect } from 'react';
import { getAllCategories, SYMBOL_BOARD } from '@/utils/category-helpers';
import Button from '@/components/ui/Button';
import Card, { CategoryCard } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import Accordion from '@/components/ui/Accordion';
import { Newspaper, Hand, MessageCircle, Mic, Smile, Trash2, Palette } from 'lucide-react';

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
  const [category, setCategory] = useState(preselectedCategory || '');
  const [textContent, setTextContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showSymbols, setShowSymbols] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');  // For preview display only
  const [imageFile, setImageFile] = useState<File | null>(null);  // Actual file for upload
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [drawingData, setDrawingData] = useState('');

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Top of form ref for scrolling
  const formTopRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || (!textContent && !imageFile && !drawingData && !audioBlob)) {
      alert('Please choose a category and add some content (text, image, audio, or drawing)');
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
          userName: authorName || 'Community Member',
        }),
      });

      if (response.ok) {
        // Step 2: Show success animation on button
        setSubmitSuccess(true);

        // Step 3: Show toast notification
        setShowToast(true);
        setTimeout(() => setShowToast(false), 6000);

        // Step 4: Set success message for banner
        setSuccessMessage('✓ Thank you! Your contribution is being reviewed by our team. You\'ll see it in the next magazine edition once approved!');

        // Step 5: Clear form
        setCategory('');
        setTextContent('');
        setAuthorName('');
        setImagePreview('');
        setImageFile(null);
        setDrawingData('');
        setAudioBlob(null);
        setAudioUrl(null);

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
        alert(`Submission failed: ${response.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset form and hide success message
  const handleSubmitAnother = () => {
    setSuccessMessage('');
    setSubmitSuccess(false);
    setShowToast(false);
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
      alert('Failed to start audio recording. Please allow microphone access.');
      setAudioRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image file is too large. Please select an image under 5MB.');
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
    }
  };

  // Drawing functions (restored from original simple implementation)
  useEffect(() => {
    if (showDrawing && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

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
    alert('Drawing saved! It will be included with your submission.');
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
                <p className="mb-4 opacity-95">
                  Thank you! Your contribution is being reviewed by our team. You&apos;ll see it in the next magazine edition once approved.
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

      <form onSubmit={handleSubmit}>
        {/* Category Selection with CategoryCard - Only show if not preselected */}
        {!preselectedCategory && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Select a category for your contribution
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name (optional)"
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
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Share your story, news, or just say hello..."
              rows={6}
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-gray">
                {textContent.length} / 500 characters
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
                <div className="grid grid-cols-6 gap-2">
                  {symbols.map((symbol) => (
                    <button
                      key={symbol}
                      type="button"
                      className="h-10 w-10 flex items-center justify-center text-xl rounded hover:bg-background transition-colors"
                      onClick={() => {
                        setTextContent(prev => prev + symbol + ' ');
                        setShowSymbols(false);
                      }}
                    >
                      {symbol}
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
            <label className="block text-sm font-medium mb-1">Add a photo (optional)</label>
            <div
              onClick={() => document.getElementById('imageInput')?.click()}
              className="border-2 border-dashed border-light-gray rounded-xl p-6 text-center cursor-pointer bg-background hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <p className="text-dark-gray mb-2">📷 Click to add a photo</p>
              <p className="text-sm text-dark-gray/70">or drag and drop here</p>
              <p className="text-sm text-dark-gray/70 mt-1">JPG, PNG or GIF (max. 5MB)</p>
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
                  alt="Uploaded image preview"
                  className="max-w-full rounded-xl shadow-card"
                />
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
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="block w-full h-auto bg-white cursor-crosshair touch-none"
                />
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
          <div className="mt-8">
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

      {/* Toast Notification - Fixed at bottom-right */}
      {showToast && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(39, 174, 96, 0.4)',
            zIndex: 9999,
            maxWidth: '400px',
            animation: 'slideInRight 0.4s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}
        >
          <div style={{
            fontSize: '28px',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '4px'
            }}>
              Success!
            </div>
            <div style={{
              fontSize: '14px',
              opacity: 0.95
            }}>
              Your contribution has been submitted for review.
            </div>
          </div>
          <button
            onClick={() => setShowToast(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @media (max-width: 640px) {
          [role="alert"] {
            bottom: 16px;
            right: 16px;
            left: 16px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}