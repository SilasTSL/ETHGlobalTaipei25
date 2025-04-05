"use client"

import { useState } from "react"
import { ShoppingBag, ExternalLink, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

interface ProductAdProps {
  ad: {
    id: number
    productName: string
    brandName: string
    description: string
    price: string
    discount?: string
    imageUrl: string
    ctaText: string
    ctaUrl: string
  }
}

export function ProductAd({ ad }: ProductAdProps) {
  const router = useRouter()

  const [showDetails, setShowDetails] = useState(false)
  const [showAdLabel, setShowAdLabel] = useState(true)

  return (
    <>
      <div className="relative w-full h-full bg-black">
        <div
          className="w-full h-full flex flex-col items-center justify-end"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%), url(${ad.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {showAdLabel && (
            <div className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1 flex items-center">
              <ShoppingBag className="h-3 w-3 mr-1 text-primary" />
              <span className="text-xs font-medium text-white">Sponsored</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 text-white/70 hover:text-white"
                onClick={() => setShowAdLabel(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-primary">{ad.brandName}</span>
                {ad.discount && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{ad.discount}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{ad.productName}</h3>
              <p className="text-sm text-white/80 mb-3 line-clamp-2">{ad.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-bold text-white">{ad.price}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white p-0"
                  onClick={() => setShowDetails(true)}
                >
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-xs">Details</span>
                </Button>
              </div>

              <div className="flex gap-2">
                <Button className="w-full" onClick={() => router.push(ad.ctaUrl)}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {ad.ctaText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ad.productName}</DialogTitle>
            <DialogDescription className="text-gray-400">By {ad.brandName}</DialogDescription>
          </DialogHeader>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
            <img src={ad.imageUrl || "/placeholder.svg"} alt={ad.productName} className="object-cover w-full h-full" />
            {ad.discount && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                {ad.discount}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-300">{ad.description}</p>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Price</span>
                <span className="text-lg font-bold text-white">{ad.price}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Availability</span>
                <span className="text-sm text-green-500">In Stock</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p>
                This is a sponsored product. Your data will not be shared with the advertiser unless you click through.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button onClick={() => router.push(ad.ctaUrl)}>
              {ad.ctaText}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

