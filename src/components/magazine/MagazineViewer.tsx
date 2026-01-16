'use client';

import { useState, ReactNode } from 'react';
import ReadingProgress from '@/components/ui/ReadingProgress';
import AccessibilityToolbar from '@/components/ui/AccessibilityToolbar';
import ShareButton from '@/components/ui/ShareButton';
import PrintButton from '@/components/ui/PrintButton';

interface MagazineViewerProps {
  children: ReactNode;
  title: string;
}

export default function MagazineViewer({ children, title }: MagazineViewerProps) {
  const [fontSize, setFontSize] = useState(16);

  return (
    <>
      {/* P5-6: Reading Progress */}
      <ReadingProgress />

      {/* P5-2, P5-3, P5-8: Accessibility Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 no-print">
        <AccessibilityToolbar onFontSizeChange={setFontSize} />
        <div className="flex items-center gap-2">
          {/* P5-5: Share Button */}
          <ShareButton title={title} />
          {/* P5-4: Print Button */}
          <PrintButton />
        </div>
      </div>

      {/* Magazine Content with adjustable font size */}
      <div style={{ fontSize: `${fontSize}px` }}>
        {children}
      </div>
    </>
  );
}
