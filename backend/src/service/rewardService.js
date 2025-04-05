import { parseEther, formatEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { EthereumWalletClient } from './web3/init_web3.js'
import dotenv from 'dotenv'
import axios from 'axios'
import {
  logInfluencePostRewardEvent,
  logDataUsagePostRewardEvent,
  logDataRecoPostRewardEvent,
} from './smartContract/PostRewardLoggingService.js'

dotenv.config()

const ADMIN_ACCOUNT = privateKeyToAccount(`0x${process.env.MY_PRIVATE_KEY}`)
const RECOMMENDATION_URL =
  process.env.RECOMMENDATION_URL || 'http://localhost:5001'

// Sample hardcoded reward amount in Ethereum
const REWARD_POOL = parseEther('0.0001')

/**
 * Initiate the reward calculation and distribution process
 * @param {string} userId - User ID who made the purchase
 * @param {string} txHash - Purchase transaction hash
 * @param {Object} txDetails - Transaction details
 */
const initiateRewardCalculation = async (
  purchasingUserAddress,
  txHash,
  txDetails,
) => {
  try {
    console.log(`Initiating reward calculation for transaction ${txHash}`)

    // Prepare request data in the format expected by the recommendation service
    const requestData = {
      purchasingUserAddress,
      merchantType: txDetails.merchantType,
      merchantLocation: txDetails.merchantLocation,
      transactionTitle: txDetails.transactionTitle,
    }

    console.log('Sending request to recommendation service:', requestData)

    // Call recommendation service to calculate influence scores
    const response = await axios.post(
      `${RECOMMENDATION_URL}/calculate-rewards`,
      requestData,
    )


    console.log('Response from recommendation service:');
    console.log(response.data);

    // Validate response
    if (
      !response.data ||
      !response.data.users ||
      !Array.isArray(response.data.users)
    ) {
      throw new Error('Invalid response from recommendation service')
    }

    const usersToBeRewarded = response.data.users

    // Distribute rewards based on calculated scores
    await distributeInfluenceRewards(
      txHash,
      purchasingUserAddress,
      usersToBeRewarded,
      txDetails,
    )

    console.log(`Reward distribution completed for transaction ${txHash}`)
    return true
  } catch (error) {
    console.error(
      `Failed to calculate and distribute rewards: ${error.message}`,
    )
    if (error.response) {
      console.error(
        'Recommendation service error details:',
        error.response.data,
      )
    }
    throw error
  }
}



/**
 * Distribute rewards based on influence scores
 * @param {string} txHash - Purchase transaction hash
 * @param {Array} users - Array of users [{ userId, walletAddress, influenceScore }]
 */
const distributeInfluenceRewards = async (
  txHash,
  purchasingUserAddress,
  usersToBeRewarded,
  txDetails,
) => {
  if (
    !txHash ||
    !Array.isArray(usersToBeRewarded) ||
    usersToBeRewarded.length === 0
  ) {
    throw new Error('Invalid parameters')
  }

  const rewardPaymentTxs = []
  const influenceScores = []

  for (const user of usersToBeRewarded) {
    const { influenceScore, walletAddress } = user
    // Calculate reward amount directly as percentage of REWARD_POOL
    // influenceScore is already a percentage (e.g., 82.12312341412412)
    const rewardAmount =
      (BigInt(Math.floor(influenceScore * 100)) * REWARD_POOL) / BigInt(100)
    console.log(
      `Transferring ${formatEther(rewardAmount)} ETH to ${walletAddress}`,
    )

    try {
      const transactionHash = await EthereumWalletClient.sendTransaction({
        to: walletAddress,
        value: rewardAmount,
        account: ADMIN_ACCOUNT,
      })
      console.log(`Transaction ${transactionHash} successful`)
      rewardPaymentTxs.push(transactionHash)
      influenceScores.push(BigInt(Math.floor(influenceScore * process.env.INFLUENCE_SCORE_MULTIPLIER)))
    } catch (error) {
      console.error(`Failed to transfer to ${walletAddress}:`, error)
    }
  }

  console.log("Purchasing user address:")
  console.log(purchasingUserAddress);
  
  
  logInfluencePostRewardEvent(
    txHash,
    purchasingUserAddress,
    txDetails,
    usersToBeRewarded=usersToBeRewarded.map(user => user.walletAddress),
    influenceScores,
    rewardPaymentTxs,
  )

  return { success: true, message: 'Rewards distributed' }
}

/**
 * Payout fixed amount to all users
 * (Currently hardcoded to a single user for testing)
 */
const distributeDataUsageRewards = async (userWallet) => {
  const FIXED_AMOUNT = parseEther('0.00001')

  try {
    console.log(
      `Paying out ${formatEther(FIXED_AMOUNT)} ETH to ${userWallet}`,
    )

    const transactionHash = await EthereumWalletClient.sendTransaction({
      to: userWallet,
      value: FIXED_AMOUNT,
      account: ADMIN_ACCOUNT,
    })

    console.log(`Transaction ${transactionHash} successful`)

    logDataUsagePostRewardEvent(1, userWallet, 1, 1, transactionHash)
  } catch (error) {
    console.error('Payout failed:', error)
  }

  return {
    success: true,
    message: `Paid out to all users for training data usage`,
  }
}

const distributeDataRecoRewards = async (userAddress, rewardAmount) => {
  try {
    console.log(`Paying out ${formatEther(rewardAmount)} ETH to ${userAddress}`)

    const transactionHash = await EthereumWalletClient.sendTransaction({
      to: userAddress,
      value: parseEther(rewardAmount),
      account: ADMIN_ACCOUNT,
    })

    console.log(`Transaction ${transactionHash} successful`)

    logDataRecoPostRewardEvent(userAddress, transactionHash)
  } catch (error) {
    console.error('Payout failed:', error)
  }

  return {
    success: true,
    message: `Paid out ${formatEther(rewardAmount)} tokens to user`,
  }
}
export {
  distributeDataUsageRewards,
  distributeDataRecoRewards,
  initiateRewardCalculation,
  distributeInfluenceRewards,
}
