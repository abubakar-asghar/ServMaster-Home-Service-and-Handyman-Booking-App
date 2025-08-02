import { Skeleton } from "../../../components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Filter and Add Button Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-6" />
            ))}
          </div>
        </div>

        {/* Table Body - 5 rows */}
        {[...Array(5)].map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid grid-cols-5 gap-4 p-4 border-b"
          >
            {/* Name Column */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-full" />
            </div>

            {/* Description Column */}
            <div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4 mt-1" />
            </div>

            {/* Category Column */}
            <div>
              <Skeleton className="h-5 w-2/3" />
            </div>

            {/* Date Column */}
            <div>
              <Skeleton className="h-5 w-1/2" />
            </div>

            {/* Actions Column */}
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
