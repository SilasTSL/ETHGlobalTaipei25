import { encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { BaseWalletClient } from '../web3/init_web3.js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

// Post Smart contract and admin details
const CONTRACT_ADDRESS = process.env.POST_CONTRACT_ADDRESS
const ADMIN_ACCOUNT = privateKeyToAccount(`0x${process.env.MY_PRIVATE_KEY}`)

const ABI = JSON.parse(fs.readFileSync('./contract/PostRewardsABI.json'))

const logInfluencePostRewardEvent = async (
  txHash,
  purchasingUserAddress,
  txDetails,
  usersTobeRewarded,
  influenceScores,
  rewardPaymentTxs,
) => {
  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'logInfluenceReward',
      args: [
        txHash,
        purchasingUserAddress,
        txDetails,
        usersTobeRewarded,
        influenceScores,
        rewardPaymentTxs,
      ],
    })

    const transactionHash = await BaseWalletClient.sendTransaction({
      to: CONTRACT_ADDRESS,
      data,
      account: ADMIN_ACCOUNT,
    })

    console.log(
      'Smart contract logging post influence rewards:',
      transactionHash,
    )
  } catch (error) {
    console.error('Failed to log influence rewards on-chain:', error)
  }
}

const logDataUsagePostRewardEvent = async (
  batchId,
  walletAddress,
  userDataContributed,
  totalDataContributed,
  rewardPaymentTx,
) => {
  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'logTrainingDataUsage',
      args: [
        batchId,
        walletAddress,
        userDataContributed,
        totalDataContributed,
        rewardPaymentTx,
      ],
    })

    const transactionHash = await BaseWalletClient.sendTransaction({
      to: CONTRACT_ADDRESS,
      data,
      account: ADMIN_ACCOUNT,
    })

    console.log('Smart contract logged data usage reward:', transactionHash)
  } catch (error) {
    console.error('Failed to log data usage rewards on-chain:', error)
  }
}

const logDataRecoPostRewardEvent = async (walletAddress, rewardPaymentTx) => {
  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'logRecommendationDataUsage',
      args: [walletAddress, rewardPaymentTx],
    })

    const transactionHash = await BaseWalletClient.sendTransaction({
      to: CONTRACT_ADDRESS,
      data,
      account: ADMIN_ACCOUNT,
    })

    console.log('Smart contract recommendation usage reward:', transactionHash)
  } catch (error) {
    console.error('Failed to log data usage rewards on-chain:', error)
  }
}

export {
  logInfluencePostRewardEvent,
  logDataUsagePostRewardEvent,
  logDataRecoPostRewardEvent,
}
