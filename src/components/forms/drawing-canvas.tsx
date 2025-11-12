'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icon replacements (emojis instead of lucide-react to reduce bundle size)
const icons = {
  palette: '🎨',
  pen: '✏️',
  eraser: '🧹',
  rotate: '↻',
  download: '⬇️',
};

interface DrawingCanvasProps {
  onSave?: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

export function DrawingCanvas({ 
  onSave, 
  width = 600, 
  height = 400 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
  ];

  const lineWidths = [1, 3, 5, 8, 12];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? 
      e.touches[0].clientX - rect.left : 
      e.nativeEvent.offsetX;
    const y = 'touches' in e ? 
      e.touches[0].clientY - rect.top : 
      e.nativeEvent.offsetY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? 
      e.touches[0].clientX - rect.left : 
      e.nativeEvent.offsetX;
    const y = 'touches' in e ? 
      e.touches[0].clientY - rect.top : 
      e.nativeEvent.offsetY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    if (onSave) {
      onSave(dataUrl);
    } else {
      // Download the image
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">{icons.palette}</span>
          Drawing Canvas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Selection */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pen')}
          >
            <span className="mr-2">{icons.pen}</span>
            Draw
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
          >
            <span className="mr-2">{icons.eraser}</span>
            Erase
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
          >
            <span className="mr-2">{icons.rotate}</span>
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveDrawing}
          >
            <span className="mr-2">{icons.download}</span>
            Save
          </Button>
        </div>

        {/* Color Palette */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm font-medium">Colors:</span>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool('pen');
              }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c && tool === 'pen' ? 'border-primary scale-110' : 'border-border'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>

        {/* Line Width */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm font-medium">Size:</span>
          {lineWidths.map((width) => (
            <button
              key={width}
              onClick={() => setLineWidth(width)}
              className={`px-3 py-1 rounded border-2 transition-all ${
                lineWidth === width ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              {width}px
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="border-2 border-border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ 
              touchAction: 'none',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Use your mouse or finger to draw. Choose colors and brush sizes above.
        </p>
      </CardContent>
    </Card>
  );
}