/**
 * Shared category utility functions
 * Task 2.6: Consolidate Magazine Viewers - Extract shared helpers
 * Task 3.2: Enhanced with complete category metadata and type safety
 */

import { SubmissionCategory } from '@prisma/client';

// Complete category metadata
export const CATEGORIES = {
  MY_NEWS: {
    emoji: '📰',
    label: 'My News',
    color: '#f39c12', // Orange
    description: 'Share your updates and stories'
  },
  SAYING_HELLO: {
    emoji: '👋',
    label: 'Saying Hello',
    color: '#27ae60', // Green
    description: 'Connect with friends and community'
  },
  MY_SAY: {
    emoji: '💬',
    label: 'My Say',
    color: '#9b59b6', // Purple
    description: 'Share your thoughts and opinions'
  },
  default: {
    emoji: '📝',
    label: 'Story',
    color: '#3498db', // Blue
    description: 'Share your content'
  }
} as const;

// Type-safe category info retrieval
export function getCategoryInfo(category: string) {
  return CATEGORIES[category as keyof typeof CATEGORIES] || CATEGORIES.default;
}

// Individual getters for backward compatibility
export function getCategoryEmoji(category: string): string {
  return getCategoryInfo(category).emoji;
}

export function getCategoryColor(category: string): string {
  return getCategoryInfo(category).color;
}

export function getCategoryLabel(category: string): string {
  return getCategoryInfo(category).label;
}

export function getCategoryDescription(category: string): string {
  return getCategoryInfo(category).description;
}

// Legacy function for name conversion
export function getCategoryName(category: string): string {
  return category.replace(/_/g, ' ');
}

// Get all available categories for forms/dropdowns
export function getAllCategories(): Array<{
  value: SubmissionCategory;
  label: string;
  emoji: string;
  color: string;
  description: string;
}> {
  return Object.entries(CATEGORIES)
    .filter(([key]) => key !== 'default')
    .map(([key, value]) => ({
      value: key as SubmissionCategory,
      label: value.label,
      emoji: value.emoji,
      color: value.color,
      description: value.description
    }));
}

// Symbol board for quick emoji insertion in forms (with accessible labels)
export const SYMBOL_BOARD = [
  { symbol: '😊', label: 'Smiling face' },
  { symbol: '❤️', label: 'Red heart' },
  { symbol: '👍', label: 'Thumbs up' },
  { symbol: '🎉', label: 'Party popper' },
  { symbol: '🌟', label: 'Glowing star' },
  { symbol: '☀️', label: 'Sun' },
  { symbol: '🌈', label: 'Rainbow' },
  { symbol: '🎵', label: 'Musical note' },
  { symbol: '🏠', label: 'House' },
  { symbol: '🚗', label: 'Car' },
  { symbol: '🍕', label: 'Pizza' },
  { symbol: '⚽', label: 'Football' },
] as const;
