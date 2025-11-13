'use client';

import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface InputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = ''
}: InputProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 rounded-xl border border-light-gray focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface TextAreaProps {
  label: string;
  id: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export const TextArea = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  rows = 4,
  className = ''
}: TextAreaProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="w-full px-4 py-2 rounded-xl border border-light-gray focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export const FileUpload = ({
  onFileSelect,
  label = 'Upload Image'
}: {
  onFileSelect: (file: File) => void;
  label?: string;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          ${dragActive ? 'border-primary bg-primary/5' : 'border-light-gray hover:border-dark-gray'}
          transition-colors
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center">
          <Upload className="w-10 h-10 text-dark-gray mb-3" />
          <p className="text-dark-gray">
            Click to add a photo or drag and drop here
          </p>
          <p className="text-sm text-dark-gray/70 mt-1">
            JPG, PNG or GIF (max. 5MB)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept="image/*"
        />
      </div>
    </div>
  );
};
