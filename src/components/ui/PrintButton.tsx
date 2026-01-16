'use client';

import Button from '@/components/ui/Button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  label?: string;
}

export default function PrintButton({ label = 'Print / PDF' }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      aria-label="Print this page or save as PDF"
      className="no-print"
    >
      <Printer className="h-4 w-4 mr-1" aria-hidden="true" />
      {label}
    </Button>
  );
}
