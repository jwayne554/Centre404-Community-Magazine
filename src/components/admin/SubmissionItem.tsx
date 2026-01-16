'use client';

import React from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getCategoryLabel, getCategoryColor } from '@/utils/category-helpers';
import { CheckCircle, Clock, XCircle, Eye, Palette, Newspaper, Hand, MessageCircle } from 'lucide-react';

// Category icons mapping (matches submission form)
const categoryIcons: Record<string, React.ReactNode> = {
  MY_NEWS: <Newspaper className="h-6 w-6" />,
  SAYING_HELLO: <Hand className="h-6 w-6" />,
  MY_SAY: <MessageCircle className="h-6 w-6" />,
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
      label: 'Pending Review',
      icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />
    },
    REJECTED: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'Not Published',
      icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
    }
  };

  const config = statusConfig[status];
  const categoryIcon = categoryIcons[category] || <Newspaper className="h-6 w-6" />;
  const categoryColor = getCategoryColor(category);

  // Format date to match prototype style
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className={`p-6 mb-4 hover:shadow-lg transition-shadow ${selected ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Checkbox for bulk selection */}
          {selectable && (
            <label className="flex-shrink-0 relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect?.(id, e.target.checked)}
                className="sr-only peer"
                aria-label={`Select submission by ${author}`}
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${selected
                  ? 'bg-primary border-primary'
                  : 'border-dark-gray/40 peer-hover:border-primary/60 peer-focus:ring-2 peer-focus:ring-primary/20'
                }`}
              >
                {selected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </label>
          )}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
          >
            {categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-charcoal">
                {getCategoryLabel(category)}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.icon}
                {config.label}
              </span>
            </div>
            <p className="text-sm text-dark-gray">
              {author} • {formatDate(date)}
            </p>
          </div>
        </div>
      </div>

      {content && (
        <p className="text-sm text-charcoal mb-4 line-clamp-2 leading-relaxed">
          {content}
        </p>
      )}

      {hasImage && imageUrl && (
        <div className="mb-4">
          <Image
            src={imageUrl}
            alt={`Image submitted by ${author} in ${getCategoryLabel(category)}`}
            width={400}
            height={160}
            className="w-full max-w-xs h-40 object-cover rounded-lg border border-light-gray"
          />
        </div>
      )}

      {hasDrawing && (
        <div className="mb-4">
          <div className="bg-background p-3 rounded-lg border border-light-gray inline-flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-sm text-dark-gray">Contains drawing by {author}</span>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onViewFull}
        icon={<Eye className="h-4 w-4" />}
      >
        View Full Submission
      </Button>
    </Card>
  );
};

export default SubmissionItem;
