/**
 * Shared category utility functions
 * Task 2.6: Consolidate Magazine Viewers - Extract shared helpers
 */

export function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'MY_NEWS':
      return '📰';
    case 'SAYING_HELLO':
      return '👋';
    case 'MY_SAY':
      return '💬';
    default:
      return '📝';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'MY_NEWS':
      return '#f39c12'; // Orange
    case 'SAYING_HELLO':
      return '#27ae60'; // Green
    case 'MY_SAY':
      return '#9b59b6'; // Purple
    default:
      return '#3498db'; // Blue
  }
}

export function getCategoryName(category: string): string {
  return category.replace(/_/g, ' ');
}

export function getCategoryLabel(category: string): string {
  const name = getCategoryName(category);
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
