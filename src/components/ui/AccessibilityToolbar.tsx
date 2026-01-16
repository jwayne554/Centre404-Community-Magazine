'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, ZoomIn, ZoomOut, Contrast, RotateCcw } from 'lucide-react';

interface AccessibilityToolbarProps {
  onFontSizeChange?: (size: number) => void;
}

export default function AccessibilityToolbar({ onFontSizeChange }: AccessibilityToolbarProps) {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-fontSize');
    const savedHighContrast = localStorage.getItem('accessibility-highContrast');
    const savedDarkMode = localStorage.getItem('accessibility-darkMode');

    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      setFontSize(size);
      onFontSizeChange?.(size);
    }
    if (savedHighContrast === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [onFontSizeChange]);

  // P5-2: Font size controls
  const increaseFontSize = () => {
    const newSize = Math.min(24, fontSize + 2);
    setFontSize(newSize);
    localStorage.setItem('accessibility-fontSize', newSize.toString());
    onFontSizeChange?.(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(12, fontSize - 2);
    setFontSize(newSize);
    localStorage.setItem('accessibility-fontSize', newSize.toString());
    onFontSizeChange?.(newSize);
  };

  // P5-3: High contrast mode
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('accessibility-highContrast', newValue.toString());
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  // P5-8: Dark mode
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('accessibility-darkMode', newValue.toString());
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Reset all
  const resetAll = () => {
    setFontSize(16);
    setHighContrast(false);
    setDarkMode(false);
    localStorage.removeItem('accessibility-fontSize');
    localStorage.removeItem('accessibility-highContrast');
    localStorage.removeItem('accessibility-darkMode');
    document.documentElement.classList.remove('high-contrast', 'dark');
    onFontSizeChange?.(16);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 p-2 bg-white dark:bg-gray-800 rounded-xl border border-light-gray dark:border-gray-700 shadow-sm">
      {/* Font Size Controls */}
      <div className="flex items-center gap-1 pr-2 border-r border-light-gray dark:border-gray-700">
        <button
          onClick={decreaseFontSize}
          disabled={fontSize <= 12}
          className="p-2 rounded-lg hover:bg-background dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease font size"
          title="Decrease font size"
        >
          <ZoomOut className="h-4 w-4 text-charcoal dark:text-white" />
        </button>
        <span className="text-xs font-medium text-dark-gray dark:text-gray-300 min-w-[3ch] text-center">
          {fontSize}
        </span>
        <button
          onClick={increaseFontSize}
          disabled={fontSize >= 24}
          className="p-2 rounded-lg hover:bg-background dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase font size"
          title="Increase font size"
        >
          <ZoomIn className="h-4 w-4 text-charcoal dark:text-white" />
        </button>
      </div>

      {/* High Contrast Toggle */}
      <button
        onClick={toggleHighContrast}
        className={`p-2 rounded-lg transition-colors ${
          highContrast
            ? 'bg-primary text-white'
            : 'hover:bg-background dark:hover:bg-gray-700 text-charcoal dark:text-white'
        }`}
        aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
        aria-pressed={highContrast}
        title="High contrast mode"
      >
        <Contrast className="h-4 w-4" />
      </button>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg transition-colors ${
          darkMode
            ? 'bg-primary text-white'
            : 'hover:bg-background dark:hover:bg-gray-700 text-charcoal dark:text-white'
        }`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={darkMode}
        title="Dark mode"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Reset Button */}
      <button
        onClick={resetAll}
        className="p-2 rounded-lg hover:bg-background dark:hover:bg-gray-700 text-dark-gray dark:text-gray-400 transition-colors"
        aria-label="Reset accessibility settings"
        title="Reset settings"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
