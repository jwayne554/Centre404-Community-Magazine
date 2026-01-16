'use client';

import React from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getCategoryEmoji, getCategoryLabel } from '@/utils/category-helpers';

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
}

const SubmissionItem = ({
  category,
  author,
  date,
  content,
  status,
  hasImage,
  imageUrl,
  hasDrawing,
  onViewFull
}: SubmissionItemProps) => {
  const statusConfig = {
    APPROVED: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      label: 'Approved'
    },
    PENDING: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Pending'
    },
    REJECTED: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'Rejected'
    }
  };

  const config = statusConfig[status];
  const categoryEmoji = getCategoryEmoji(category);

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
    <Card className="p-5 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl flex-shrink-0">
            {categoryEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-charcoal">
                {getCategoryLabel(category)}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${config.bg} ${config.text}`}>
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
            <span className="text-2xl" aria-hidden="true">🎨</span>
            <span className="text-sm text-dark-gray">Contains drawing by {author}</span>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onViewFull}
      >
        👁️ View Full Submission
      </Button>
    </Card>
  );
};

export default SubmissionItem;
