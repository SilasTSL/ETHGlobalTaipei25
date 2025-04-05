import Interaction from '../model/Interaction.js'

/**
 * Track a new user interaction
 * @param {string} userId - User's ID
 * @param {string} videoId - Video ID
 * @param {string} type - Interaction type (watch, like, share, comment)
 * @param {number} duration - Duration of interaction (for watch events)
 * @param {object} metadata - Additional metadata about the interaction
 */
export const trackInteraction = async (userId, videoId, type, duration = 0, metadata = {}) => {
  try {
    const interaction = new Interaction({
      userId,
      videoId,
      type,
      metadata,
    })
    await interaction.save()
    return { success: true, interaction }
  } catch (error) {
    console.error('Failed to track interaction:', error)
    throw new Error('Failed to track interaction')
  }
}

/**
 * Get user interactions for a specific video
 * @param {string} videoId - Video ID to query
 * @param {string} type - Optional interaction type filter
 */
export const getVideoInteractions = async (videoId, type = null) => {
  try {
    const query = { videoId }
    if (type) {
      query.type = type
    }
    
    const interactions = await Interaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
    
    return { success: true, interactions }
  } catch (error) {
    console.error('Failed to get video interactions:', error)
    throw new Error('Failed to get video interactions')
  }
}

/**
 * Get user's interaction history
 * @param {string} userId - User ID to query
 * @param {string} type - Optional interaction type filter
 */
export const getUserInteractions = async (userId, type = null) => {
  try {
    const query = { userId }
    if (type) {
      query.type = type
    }
    
    const interactions = await Interaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
    
    return { success: true, interactions }
  } catch (error) {
    console.error('Failed to get user interactions:', error)
    throw new Error('Failed to get user interactions')
  }
} 