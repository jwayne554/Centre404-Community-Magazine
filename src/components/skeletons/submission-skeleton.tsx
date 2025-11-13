/**
 * Submission Skeleton - Loading placeholder for submission cards
 * Task 4.1: Add Skeleton Screens
 */

export function SubmissionSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {/* Category badge skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24 mb-2"></div>
          {/* Status badge skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
        </div>
        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        {/* Content type skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>

        {/* Text content skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>

        {/* Media preview skeleton (conditionally shown) */}
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg w-48"></div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Submitter info skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>

        {/* Review info skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of submission skeletons for initial page load
 */
export function SubmissionSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SubmissionSkeleton key={index} />
      ))}
    </div>
  );
}
