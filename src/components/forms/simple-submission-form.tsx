'use client';

import { useState, useRef, useEffect } from 'react';

const categories = [
  { value: 'MY_NEWS', label: 'My News', icon: '📰', description: 'Share your updates' },
  { value: 'SAYING_HELLO', label: 'Saying Hello', icon: '👋', description: 'Connect with friends' },
  { value: 'MY_SAY', label: 'My Say', icon: '💬', description: 'Share your thoughts' },
];

const symbols = ['😊', '❤️', '👍', '🎉', '🌟', '☀️', '🌈', '🎵', '🏠', '🚗', '🍕', '⚽'];

export function SimpleSubmissionForm() {
  const [category, setCategory] = useState('');
  const [textContent, setTextContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showSymbols, setShowSymbols] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [drawingData, setDrawingData] = useState('');

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || (!textContent && !imagePreview && !drawingData && !audioBlob)) {
      alert('Please choose a category and add some content (text, image, audio, or drawing)');
      return;
    }

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

      // Determine content type based on what's provided
      let contentType = 'TEXT';
      if (audioMediaUrl && textContent) contentType = 'MIXED';
      else if (audioMediaUrl) contentType = 'AUDIO';
      else if (imagePreview && textContent) contentType = 'MIXED';
      else if (imagePreview) contentType = 'IMAGE';
      else if (drawingData) contentType = 'DRAWING';

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          textContent: textContent || '',
          contentType,
          mediaUrl: audioMediaUrl || imagePreview || drawingData || null,
          drawingData: drawingData || null,
          userName: authorName || 'Community Member',
        }),
      });

      if (response.ok) {
        setSuccessMessage('✓ Thank you! Your contribution is being reviewed by our team. You\'ll see it in the next magazine edition once approved!');
        setCategory('');
        setTextContent('');
        setAuthorName('');
        setImagePreview('');
        setDrawingData('');
        setAudioBlob(null);
        setAudioUrl(null);
        // Clear canvas if it exists
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        const errorData = await response.text();
        console.error('Submission failed:', response.status, errorData);
        alert(`Submission failed: ${response.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please check your connection and try again.');
    }
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drawing functions
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
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Share Your Story</h2>
      
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Category Selection - Matching original style */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '10px',
            color: 'var(--text-color)'
          }}>
            Choose a category:
          </label>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <div key={cat.value} style={{ flex: 1, minWidth: '200px' }}>
                <input
                  type="radio"
                  id={cat.value}
                  name="category"
                  value={cat.value}
                  checked={category === cat.value}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ position: 'absolute', opacity: 0 }}
                  required
                />
                <label
                  htmlFor={cat.value}
                  className={`category-card ${category === cat.value ? 'selected' : ''}`}
                >
                  <div style={{ fontSize: '30px', marginBottom: '8px' }}>{cat.icon}</div>
                  <div style={{ fontWeight: '600' }}>{cat.label}</div>
                  <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.8 }}>
                    {cat.description}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Author Name - Optional field */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '10px',
            color: 'var(--text-color)'
          }}>
            Your name (optional):
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Tell us your name or leave blank"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontFamily: 'inherit',
              background: 'white'
            }}
            maxLength={50}
          />
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            If left blank, your post will show as &quot;Community Member&quot;
          </div>
        </div>

        {/* Text Content - Matching original style */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '10px',
            color: 'var(--text-color)'
          }}>
            Write your message:
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Type your message here..."
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '15px',
              fontSize: '18px',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            maxLength={500}
          />
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            {textContent.length} / 500 characters
          </div>

          {/* Input Tools - Matching original style */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`tool-button ${audioRecording ? 'active' : ''}`}
              onClick={startAudioRecording}
              style={{
                background: audioRecording ? '#dc3545' : undefined,
                color: audioRecording ? 'white' : undefined
              }}
            >
              🎙️ {audioRecording ? 'Stop Recording' : 'Record Audio'}
            </button>
            <button
              type="button"
              className="tool-button"
              onClick={() => setShowSymbols(!showSymbols)}
            >
              😊 Symbols
            </button>
            <button
              type="button"
              className="tool-button"
              onClick={() => setTextContent('')}
            >
              🗑️ Clear
            </button>
          </div>

          {/* Audio Preview */}
          {audioUrl && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              background: '#e3f2fd',
              borderRadius: '8px',
              border: '2px solid #2196f3'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#1976d2',
                  fontSize: '16px'
                }}>
                  🎵 Audio Recorded
                </span>
                <button
                  type="button"
                  className="tool-button"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                    if (audioUrl) URL.revokeObjectURL(audioUrl);
                  }}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    padding: '5px 10px'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
              <audio
                controls
                src={audioUrl}
                style={{
                  width: '100%',
                  borderRadius: '4px'
                }}
              />
              <div style={{
                fontSize: '13px',
                color: '#666',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                This audio will be included with your submission
              </div>
            </div>
          )}

          {/* Symbol Board - Matching original style */}
          {showSymbols && (
            <div className="symbol-board">
              {symbols.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  className="symbol-btn"
                  onClick={() => setTextContent(prev => prev + symbol + ' ')}
                >
                  {symbol}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Image Upload - Matching original style */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '10px',
            color: 'var(--text-color)'
          }}>
            Add a photo (optional):
          </label>
          <div 
            onClick={() => document.getElementById('imageInput')?.click()}
            style={{
              border: '3px dashed var(--border-color)',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f8f9fa',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-color)';
              e.currentTarget.style.background = '#e3f2fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = '#f8f9fa';
            }}
          >
            <p style={{ fontSize: '20px', marginBottom: '10px' }}>📷 Click to add a photo</p>
            <p style={{ color: '#666' }}>or drag and drop here</p>
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Uploaded image preview"
              style={{
                maxWidth: '100%',
                marginTop: '20px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow)'
              }}
            />
          )}
        </div>

        {/* Drawing Tool - Matching original style */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '10px',
            color: 'var(--text-color)'
          }}>
            Or draw a picture (optional):
          </label>
          <button
            type="button"
            className="tool-button"
            onClick={() => setShowDrawing(!showDrawing)}
          >
            ✏️ {showDrawing ? 'Close' : 'Open'} Drawing Tool
          </button>
          {showDrawing && (
            <div style={{
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              marginTop: '15px',
              overflow: 'hidden'
            }}>
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
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  background: 'white',
                  cursor: 'crosshair',
                  touchAction: 'none'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '10px',
                padding: '10px',
                background: '#f8f9fa',
                justifyContent: 'center'
              }}>
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCurrentColor(color)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: color,
                      border: currentColor === color ? '3px solid #2c5aa0' : '3px solid transparent',
                      cursor: 'pointer',
                      transform: currentColor === color ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
                <button type="button" className="tool-button" onClick={clearCanvas}>Clear</button>
                <button type="button" className="tool-button" onClick={saveDrawing}>Save Drawing</button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button - Matching original style */}
        <button
          type="submit"
          className="btn-large btn-primary"
          style={{ width: '100%', marginTop: '30px' }}
        >
          ✓ Submit My Contribution
        </button>
      </form>
    </div>
  );
}