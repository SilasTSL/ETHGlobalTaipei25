import { Skeleton } from "@/components/ui/skeleton"

function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full bg-gray-800" />
        <div>
          <Skeleton className="h-4 w-24 bg-gray-800 mb-1" />
          <Skeleton className="h-3 w-32 bg-gray-800 mb-1" />
          <Skeleton className="h-3 w-20 bg-gray-800" />
        </div>
      </div>
      <Skeleton className="h-4 w-16 bg-gray-800" />
    </div>
  );
}

export { TransactionSkeleton };