interface Video {
    id: string
    username: string
    description: string
    likes: number
    comments: number
    hashtags: string
    shares: number
    videoUrl: string
    userAvatar: string
}

export const fetchRecommendedVideos = async (userId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_RS_URL}/user/recommendations?user_id=${userId}`)
  const data = await response.json()
  const recommendedVideos = data.recommended_videos
  console.log("Recommended videos:", recommendedVideos)
  const formattedVideos = recommendedVideos.map((video: any, index: number) => ({
    id: index + 1,
    username: video.posterUsername,
    description: video.caption,
    likes: video.likes || 0,
    hashtags: video.hashtags || "",
    comments: video.comments || 0,
    shares: video.shares || 0,
    videoUrl: `/videos/${video._id}.mp4`,
    userAvatar: null,
  }))
  console.log("Formatted videos:", formattedVideos)
  return formattedVideos
}

