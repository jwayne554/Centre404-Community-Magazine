'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface LatestEditionCardProps {
  magazineId: string;
  title: string;
  date: string;
  description: string;
}

const LatestEditionCard = ({ magazineId, title, date, description }: LatestEditionCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        {/* Left Column - Light Green Background */}
        <div className="bg-primary/10 p-8 flex items-center justify-center md:w-1/3">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-dark-gray flex items-center justify-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {date}
            </p>
          </div>
        </div>

        {/* Right Column - White Background */}
        <div className="p-6 md:p-8 md:w-2/3">
          <div className="flex items-start">
            <div className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium uppercase">
              New
            </div>
          </div>
          <h3 className="text-xl font-bold mt-3">
            Centre404 Community Magazine
          </h3>
          <p className="mt-2 text-dark-gray">
            {description}
          </p>
          <div className="mt-6">
            <Link href={`/magazines/${magazineId}`}>
              <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>
                Read Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LatestEditionCard;
