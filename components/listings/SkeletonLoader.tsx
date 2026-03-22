export function SkeletonLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} />
      ))}
    </div>
  )
}
