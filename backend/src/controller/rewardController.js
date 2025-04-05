import express from 'express'
import {
  distributeDataUsageRewards,
  distributeDataRecoRewards,
  initiateRewardCalculation,
  distributeInfluenceRewards,
} from '../service/rewardService.js'
import { getTransactionFromTransactionHash } from '../service/web3/noditDataQueries.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

/**
 * Handle webhook notifications for new transactions
 */
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature if provided
    const signature = req.headers['x-webhook-signature'];

    const transactionHash = req.body.event.messages[0].hash;

    const transactionDetails = await getTransactionFromTransactionHash(transactionHash);
    if (!transactionDetails) {
      console.log('Transaction details not found')
      return res.status(400).json({
        success: false,
        message: 'Transaction details not found'
      });
    }

    if (transactionDetails.functionType === "distributeDataRecommendationRewards") { // Data Recommendation Rewards
      const decodedInput = transactionDetails.decodedInput;
      const rewardedUserAddress = decodedInput.args[2];
      distributeDataRecoRewards(rewardedUserAddress, process.env.RECOMMENDATION_REWARD_AMOUNT)

    } else if (transactionDetails.functionType === "distributeInfluenceRewards") { // Influence Rewards
      const decodedInput = transactionDetails.decodedInput;

      const purchasingUserAddress = decodedInput.args[1];
      const txHash = transactionHash;
      const txDetails = {
        merchantType: decodedInput.args[2].merchantType,
        merchantLocation: decodedInput.args[2].merchantLocation,
        transactionTitle: decodedInput.args[2].transactionTitle,
      };

      if (!purchasingUserAddress || !txHash || !txDetails) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Make call to RS:
      const rewardCalculationResponse = await initiateRewardCalculation(purchasingUserAddress, txHash, txDetails)

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        data: rewardCalculationResponse
      });
    } else if (transactionDetails.functionType === "distributeDataTrainingRewards") { // Data Training Rewards
      const decodedInput = transactionDetails.decodedInput;
      const rewardedUserAddress = decodedInput.args[1];
      distributeDataUsageRewards(rewardedUserAddress)
    } else {
      console.log('Unknown function type:', transactionDetails.functionType)
      return res.status(400).json({
        success: false,
        message: 'Unknown function type'
      });
    }

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

/**
 * @desc Payout fixed amount to all users
 */
router.post('/distribute-data-usage-reward', async (req, res) => {
  try {
    //TODO: NODDIT CALLBACK WILL BE CALLING THIS
    return res.json({ mssg: 'not implemented waiting for noddit' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 *
 * @desc Payout amount to users when data used to recommend
 */
router.post('/distribute-reco-data-usage-reward', async (req, res) => {
  try {
    //TODO: NODDIT CALLBACK WILL BE CALLING THIS
    return res.json({ mssg: 'not implemented waiting for noddit' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
