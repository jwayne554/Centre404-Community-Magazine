'use client';

import React from 'react';

interface CategoryCardProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

const CategoryCard = ({ icon, label, description, selected, onClick }: CategoryCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-4 sm:p-6 text-center w-full
        bg-white rounded-xl cursor-pointer
        transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${selected
          ? 'border-2 border-primary bg-primary/5'
          : 'border border-light-gray hover:border-primary/50'
        }
      `}
      aria-pressed={selected}
    >
      {/* Icon Circle */}
      <div
        className={`
          p-3 sm:p-4 rounded-full mb-2 sm:mb-3
          ${selected ? 'bg-primary text-white' : 'bg-light-gray text-dark-gray'}
        `}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Label */}
      <h3 className="font-medium text-sm sm:text-base">
        {label}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-xs text-dark-gray mt-1 line-clamp-2">
          {description}
        </p>
      )}
    </button>
  );
};

export default CategoryCard;
