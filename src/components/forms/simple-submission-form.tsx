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
  const [showSymbols, setShowSymbols] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [drawingData, setDrawingData] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !textContent) {
      alert('Please choose a category and add some content');
      return;
    }

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          textContent,
          contentType: 'TEXT',
        }),
      });

      if (response.ok) {
        setSuccessMessage('✓ Thank you! Your contribution has been submitted.');
        setCategory('');
        setTextContent('');
        setImagePreview('');
        setTimeout(() => setSuccessMessage(''), 5000);
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

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
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
            setTextContent(prev => prev + finalTranscript + ' ');
          }
        };
        
        recognition.onerror = () => setIsRecording(false);
        
        setTimeout(() => {
          recognition.stop();
          setIsRecording(false);
        }, 30000); // Stop after 30 seconds
      }
    } else {
      alert('Speech recognition is not supported in your browser.');
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
              className={`tool-button ${isRecording ? 'active' : ''}`}
              onClick={startSpeechRecognition}
            >
              🎤 {isRecording ? 'Recording...' : 'Speak'}
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
              alt="Preview" 
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