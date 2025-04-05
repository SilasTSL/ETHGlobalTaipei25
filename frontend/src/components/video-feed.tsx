"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Heart, MessageCircle, Share2, Music, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchRecommendedVideos } from "@/lib/videos"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductAd } from "./product-ads"

// Mock data for videos
// const videos = [
//   {
//     id: 1,
//     username: "@cryptoCreator",
//     description: "Check out this new NFT collection I just launched! #web3 #nft",
//     music: "Blockchain Beats - Crypto Anthem",
//     likes: 1245,
//     comments: 89,
//     shares: 32,
//     videoUrl: "/videos/67eba273a10e7cbaa138c391.mp4", // Update with your actual video path
//     userAvatar: "/avatars/user1.jpg", // Update with actual avatar path
//   },
//   {
//     id: 2,
//     username: "@web3enthusiast",
//     description: "How to set up your first crypto wallet in 3 easy steps! #tutorial #crypto",
//     music: "Digital Future - Web3 Vibes",
//     likes: 3782,
//     comments: 156,
//     shares: 201,
//     videoUrl: "/videos/67eba2baa10e7cbaa138c392.mp4", // Update with your actual video path
//     userAvatar: "/avatars/user2.jpg", // Update with actual avatar path
//   },
//   {
//     id: 3,
//     username: "@defiQueen",
//     description: "Earning passive income with DeFi protocols. Here's how! #defi #passive",
//     music: "Yield Farming - Crypto Mix",
//     likes: 5621,
//     comments: 243,
//     shares: 178,
//     videoUrl: "/videos/67eba1f6a10e7cbaa138c38f.mp4", // Update with your actual video path
//     userAvatar: "/avatars/user3.jpg", // Update with actual avatar path
//   },
// ]

// Mock data for product ads
const productAds = [
  {
    id: 101,
    productName: "CryptoSecure Hardware Wallet",
    brandName: "SecureChain",
    description:
      "Keep your crypto assets safe with military-grade encryption. The most secure hardware wallet on the market.",
    price: "$129.99",
    discount: "15% OFF",
    imageUrl: "/images/101.jpg?height=720&width=405&text=CryptoSecure",
    ctaText: "Shop Now",
    ctaUrl: "/purchase?address=0xb76d3afB4AECe9f9916EB5e727B7472b609332dE&price=19.99",
  },
  {
    id: 102,
    productName: "Low-Risk Crypto Investment Guide",
    brandName: "ArtChain",
    description: "Learn how to invest in crypto with low risk and high returns.",
    price: "$19.99",
    discount: "20% OFF",
    imageUrl: "/images/102.jpeg?height=720&width=405&text=Low-Risk+Crypto+Investment+Guide",
    ctaText: "Shop Now",
    ctaUrl: "/purchase?address=0xb76d3afB4AECe9f9916EB5e727B7472b609332dE&price=5.99",
  },
]

// Function to interleave ads with videos
function interleaveAdsWithVideos(videos: Video[], ads: any, frequency = 2) {
  const result = [...videos]
  ads.forEach((ad: any, index: number) => {
    const position = (index + 1) * frequency
    if (position < result.length) {
      result.splice(position, 0, { ...ad, isAd: true })
    }
  })
  return result
}

interface Video {
  id: string
  username: string
  description: string
  likes: number
  comments: number
  shares: number
  videoUrl: string
  userAvatar: string
}

export function VideoFeed() {
  const userId = "67eb9aa0fc066d11764a28d2" // HARDCODED FOR NOW
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const contentRefs = useRef<(HTMLVideoElement | HTMLDivElement | null)[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const recommendedVideos = await fetchRecommendedVideos(userId)
        const interleavedVideos = interleaveAdsWithVideos(recommendedVideos, productAds)
        setVideos(interleavedVideos)
        setCurrentVideoIndex(0)
      } catch (err) {
        console.error("Error fetching videos:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [userId])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop
        const videoHeight = scrollContainerRef.current.clientHeight
        const index = Math.round(scrollTop / videoHeight)
        setCurrentVideoIndex(index)
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [videos])


  // Video playback control
  useEffect(() => {
    if (loading || videos.length === 0) return

    // Pause all videos first
    contentRefs.current.forEach(video => {
      if (video instanceof HTMLVideoElement) video.pause()
    })

    // Play current video
    const currentVideo = contentRefs.current[currentVideoIndex]
    console.log("videoRefs.current", contentRefs.current)
    console.log("currentVideoIndex", currentVideoIndex)
    console.log("currentVideo", currentVideo)
    if (currentVideo && currentVideo instanceof HTMLVideoElement) {
      currentVideo.currentTime = 0
      currentVideo.play().catch(console.error)
    }
  }, [currentVideoIndex, loading, videos])
  
  return (
    <div className="video-container web3-bg">
      <div ref={scrollContainerRef} className="video-scroll">
        {loading ? (
          <div className="video-item h-screen">
            <Skeleton className="w-full h-full bg-gray-800" />
            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ) : (
          videos.map((video: any, index) => (
            video.isAd ? (
              <div key={video.id} ref={(el) => {
                  contentRefs.current[index] = el
                }}
                className="scroll-item h-screen"
              >
                <ProductAd key={video.id} ad={video} />
              </div>
            ) : (
              <div key={video.id}  className="scroll-item">
                <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                  <video
                    ref={(el) => {
                      contentRefs.current[index] = el
                    }}
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                </div>

                <div className="video-overlay">
                  <div className="flex">
                    <div className="flex-1 flex flex-col justify-end pb-2">
                      <h3 className="font-bold text-white mb-1 web3-username">@{video.username}</h3>
                      <p className="text-sm text-white/80 mb-1">{video.description}</p>
                      <p className="text-sm text-white/80 mb-2">{video.hashtags}</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="w-10 h-10 border-2 web3-avatar-border">
                        <AvatarImage src={video.userAvatar} alt={video.username} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
                        <Heart className="h-6 w-6" />
                      </Button>
                      <span className="text-xs text-white">{video.likes}</span>

                      <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
                        <MessageCircle className="h-6 w-6" />
                      </Button>
                      <span className="text-xs text-white">{video.comments}</span>

                      <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
                        <Share2 className="h-6 w-6" />
                      </Button>
                      <span className="text-xs text-white">{video.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  )
}

