import {
  logDataUsagePreRewardEvent,
  logDataRecoPreRewardEvent,
} from '../service/smartContract/PreRewardLoggingService.js'
import express from 'express'

const router = express.Router()

router.post('/recommendation', async (req, res) => {
  try {
    console.log('logDataRecoPreRewardEvent')
    const { walletAddress } = req.body

    await logDataRecoPreRewardEvent(walletAddress)
    res.status(200).json({
      message: 'Data usage logged successfully',
    })
  } catch (error) {
    console.error('Error in dataUsageController:', error)
    res.status(500).json({
      message: 'Error in dataUsageController',
      error: error.message,
    })
  }
})

router.post('/training', async (req, res) => {
  try {
    const { walletAddress } = req.body

    await logDataUsagePreRewardEvent(1, walletAddress, 1, 5)
    res.status(200).json({
      message: 'Data usage logged successfully',
    })
  } catch (error) {
    console.error('Error in dataUsageController:', error)
    res.status(500).json({
      message: 'Error in dataUsageController',
      error: error.message,
    })
  }
})

export default router
