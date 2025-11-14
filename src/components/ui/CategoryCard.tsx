'use client';

import React from 'react';

interface CategoryCardProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const CategoryCard = ({ icon, label, selected, onClick }: CategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-6 text-center
        bg-white rounded-xl cursor-pointer
        transition-all
        ${selected
          ? 'border-2 border-primary bg-primary/5'
          : 'border border-light-gray hover:border-primary/50'
        }
      `}
    >
      {/* Icon Circle */}
      <div
        className={`
          p-4 rounded-full mb-3
          ${selected ? 'bg-primary text-white' : 'bg-light-gray text-dark-gray'}
        `}
      >
        {icon}
      </div>

      {/* Label */}
      <h3 className="font-medium">
        {label}
      </h3>
    </div>
  );
};

export default CategoryCard;
