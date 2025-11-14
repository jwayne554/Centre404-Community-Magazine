'use client';

import React from 'react';

interface CategoryBadgeProps {
  category: string;
  subcategory?: string;
  className?: string;
}

const CategoryBadge = ({ category, subcategory, className = '' }: CategoryBadgeProps) => {
  const displayText = subcategory
    ? `${category} - ${subcategory}`
    : category;

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1
        bg-primary/10 text-primary text-xs font-medium
        rounded-full
        ${className}
      `}
    >
      {displayText}
    </span>
  );
};

export default CategoryBadge;
