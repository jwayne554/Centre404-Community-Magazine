'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  hover?: boolean;
}

const Card = ({
  children,
  className = '',
  onClick,
  active = false,
  hover = true
}: CardProps) => {
  const activeStyles = active ? 'border-2 border-primary' : 'border border-light-gray';
  const hoverStyles = hover && !active ? 'hover:border-primary/50 transition-colors' : '';
  const clickStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-card ${activeStyles} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CategoryCard = ({
  title,
  icon,
  active = false,
  onClick
}: {
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <Card
      active={active}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 text-center transition-all ${active ? 'bg-primary/5' : ''}`}
    >
      <div className={`p-4 rounded-full mb-3 transition-colors ${active ? 'bg-primary text-white' : 'bg-light-gray text-dark-gray'}`}>
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
    </Card>
  );
};

export default Card;