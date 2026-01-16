'use client';

import React from 'react';
import Image from 'next/image';
import { getCategoryLabel, getCategoryColor } from '@/utils/category-helpers';
import { CheckCircle, Clock, XCircle, Newspaper, Hand, MessageCircle, Mic } from 'lucide-react';

// Category icons mapping (matches submission form)
const categoryIcons: Record<string, React.ReactNode> = {
  MY_NEWS: <Newspaper className="h-4 w-4" />,
  SAYING_HELLO: <Hand className="h-4 w-4" />,
  MY_SAY: <MessageCircle className="h-4 w-4" />,
};

interface SubmissionItemProps {
  id: string;
  category: string;
  author: string;
  date: string;
  content?: string | null;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  hasImage?: boolean;
  imageUrl?: string | null;
  hasDrawing?: boolean;
  drawingData?: string | null;
  contentType?: string;
  onViewFull: () => void;
  // Bulk selection props
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const SubmissionItem = ({
  id,
  category,
  author,
  date,
  content,
  status,
  hasImage,
  imageUrl,
  hasDrawing,
  drawingData,
  contentType,
  onViewFull,
  selectable = false,
  selected = false,
  onSelect
}: SubmissionItemProps) => {
  const statusConfig = {
    APPROVED: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      label: 'Approved',
      icon: <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
    },
    PENDING: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Pending',
      icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />
    },
    REJECTED: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'Rejected',
      icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
    }
  };

  const config = statusConfig[status];
  const categoryIcon = categoryIcons[category] || <Newspaper className="h-4 w-4" />;
  const categoryColor = getCategoryColor(category);

  // Check if media is audio (not image)
  const isAudio = contentType === 'AUDIO' || (imageUrl && imageUrl.endsWith('.webm'));
  const hasImagePreview = hasImage && imageUrl && !isAudio;

  // Shorter date format
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking checkbox
    if ((e.target as HTMLElement).closest('label')) return;
    onViewFull();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-white border rounded-lg p-3 mb-2 cursor-pointer
        transition-all duration-150
        hover:border-primary/30 hover:shadow-sm
        ${selected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-light-gray'}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewFull()}
      aria-label={`View submission by ${author} in ${getCategoryLabel(category)}`}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        {selectable && (
          <label className="flex-shrink-0 relative flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect?.(id, e.target.checked)}
              className="sr-only peer"
              aria-label={`Select submission by ${author}`}
            />
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
              ${selected
                ? 'bg-primary border-primary'
                : 'border-dark-gray/40 peer-hover:border-primary/60'
              }`}
            >
              {selected && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>
        )}

        {/* Category icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
        >
          {categoryIcon}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-charcoal text-sm">
              {getCategoryLabel(category)}
            </span>
            <span className="text-dark-gray text-sm">·</span>
            <span className="text-dark-gray text-sm truncate">{author}</span>
          </div>
          {content && (
            <p className="text-dark-gray text-sm truncate mt-0.5">
              {content}
            </p>
          )}
        </div>

        {/* Media thumbnails */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Image thumbnail */}
          {hasImagePreview && (
            <div className="w-10 h-10 rounded-md overflow-hidden border border-light-gray flex-shrink-0">
              <Image
                src={imageUrl}
                alt=""
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Drawing thumbnail */}
          {hasDrawing && drawingData && (
            <div className="w-10 h-10 rounded-md overflow-hidden border border-purple-200 bg-purple-50 flex-shrink-0">
              <img
                src={drawingData}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Audio indicator */}
          {isAudio && (
            <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Mic className="h-4 w-4 text-blue-500" />
            </div>
          )}
        </div>

        {/* Date */}
        <span className="text-dark-gray text-xs flex-shrink-0 w-12 text-right">
          {formatDate(date)}
        </span>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${config.bg} ${config.text}`}>
          {config.icon}
          <span className="hidden sm:inline">{config.label}</span>
        </span>
      </div>
    </div>
  );
};

export default SubmissionItem;
