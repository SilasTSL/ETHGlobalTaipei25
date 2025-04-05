import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const AssetSkeleton = () => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-gray-800" />
            <div>
              <Skeleton className="h-4 w-16 bg-gray-800 mb-1" />
              <Skeleton className="h-3 w-12 bg-gray-800" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-20 bg-gray-800 mb-1" />
            <Skeleton className="h-3 w-16 bg-gray-800" />
          </div>
        </div>
      </CardContent>
    </Card> 
  )
}