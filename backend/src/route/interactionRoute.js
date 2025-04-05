import express from 'express'
import {
  trackInteractionController,
  getVideoInteractionsController,
  getUserInteractionsController,
} from '../controller/interactionController.js'

const router = express.Router()

// Track a new interaction
router.post('/track', trackInteractionController)

// Get interactions for a specific video
router.get('/video/:videoId', getVideoInteractionsController)

// Get interactions for a specific user
router.get('/user/:userId', getUserInteractionsController)

export default router 