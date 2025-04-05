import {
    trackInteraction,
    getVideoInteractions,
    getUserInteractions,
  } from '../service/interactionService.js'
  
  export const trackInteractionController = async (req, res) => {
    try {
      const { userId, videoId, type, duration, metadata } = req.body
  
      if (!userId || !videoId || !type) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        })
      }
  
      const result = await trackInteraction(userId, videoId, type, duration, metadata)
      res.status(201).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  export const getVideoInteractionsController = async (req, res) => {
    try {
      const { videoId } = req.params
      const { type } = req.query
  
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: 'Video ID is required',
        })
      }
  
      const result = await getVideoInteractions(videoId, type)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  export const getUserInteractionsController = async (req, res) => {
    try {
      const { userId } = req.params
      const { type } = req.query
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
      }
  
      const result = await getUserInteractions(userId, type)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  } 