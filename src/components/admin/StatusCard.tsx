'use client';

import React from 'react';
import Card from '@/components/ui/Card';

interface StatusCardProps {
  title: string;
  subtitle: string;
  count: number;
  icon: React.ReactNode;
  variant?: 'default' | 'pending' | 'approved' | 'rejected';
}

const StatusCard = ({
  title,
  subtitle,
  count,
  icon,
  variant = 'default'
}: StatusCardProps) => {
  const borderColors = {
    default: 'border-light-gray',
    pending: 'border-yellow-400',
    approved: 'border-primary',
    rejected: 'border-red-400'
  };

  const iconBgColors = {
    default: 'bg-light-gray text-dark-gray',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-primary/15 text-primary',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <Card className={`p-6 ${borderColors[variant]} border-2 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-dark-gray uppercase tracking-wider font-medium mb-2">
            {title}
          </p>
          <p className="text-4xl font-bold text-charcoal">{count}</p>
        </div>
        <div className={`p-3.5 rounded-xl ${iconBgColors[variant]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-dark-gray leading-relaxed">{subtitle}</p>
    </Card>
  );
};

export default StatusCard;
