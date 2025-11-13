/**
 * Shared category and symbol constants for submission forms
 * Task 2.5: Consolidate Form Components
 */

export const SUBMISSION_CATEGORIES = [
  { value: 'MY_NEWS', label: 'My News', icon: '📰', description: 'Share your updates' },
  { value: 'SAYING_HELLO', label: 'Saying Hello', icon: '👋', description: 'Connect with friends' },
  { value: 'MY_SAY', label: 'My Say', icon: '💬', description: 'Share your thoughts' },
] as const;

export const SYMBOL_BOARD = ['😊', '❤️', '👍', '🎉', '🌟', '☀️', '🌈', '🎵', '🏠', '🚗', '🍕', '⚽'] as const;

export type SubmissionCategory = typeof SUBMISSION_CATEGORIES[number]['value'];
