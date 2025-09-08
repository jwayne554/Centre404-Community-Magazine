'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Mic, Loader2 } from 'lucide-react';

interface MediaUploadProps {
  onUpload: (url: string, type: 'image' | 'audio') => void;
  acceptedTypes?: string;
  maxSize?: number;
}

export function MediaUpload({ 
  onUpload, 
  acceptedTypes = 'image/*,audio/*',
  maxSize = 10 * 1024 * 1024 // 10MB
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    // Determine file type
    const type = file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('audio/') ? 'audio' : null;
    
    if (!type) {
      setError('Invalid file type. Please upload an image or audio file.');
      return;
    }

    setFileType(type);

    // Create preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(file.name);
    }

    // Upload file
    await uploadFile(file, type);
  };

  const uploadFile = async (file: File, type: 'image' | 'audio') => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onUpload(data.url, type);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      setPreview(null);
      setFileType(null);
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setPreview(null);
    setFileType(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const changeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(changeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {!preview ? (
        <Card
          className="border-2 border-dashed cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">Images or audio files (max 10MB)</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {fileType === 'image' ? (
                  <>
                    <img 
                      src={preview} 
                      alt="Upload preview" 
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">Image uploaded</p>
                      <p className="text-sm text-muted-foreground">Ready to submit</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-accent rounded flex items-center justify-center">
                      <Mic className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-medium">Audio uploaded</p>
                      <p className="text-sm text-muted-foreground">{preview}</p>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearUpload}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !!preview}
          className="flex-1"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Add Photo
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !!preview}
          className="flex-1"
        >
          <Mic className="mr-2 h-4 w-4" />
          Add Audio
        </Button>
      </div>
    </div>
  );
}