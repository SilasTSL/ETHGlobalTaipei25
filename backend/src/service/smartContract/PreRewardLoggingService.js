import { encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { BaseWalletClient } from '../web3/init_web3.js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

// Pre Smart contract and admin details
const CONTRACT_ADDRESS = process.env.PRE_CONTRACT_ADDRESS
const ADMIN_ACCOUNT = privateKeyToAccount(`0x${process.env.MY_PRIVATE_KEY}`)

const ABI = JSON.parse(fs.readFileSync('./contract/PreRewardsABI.json'))

const logInfluencePreRewardEvent = async (
  txHash,
  purchasingUserAddress,
  txDetails,
) => {
  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'logInfluenceReward',
      args: [txHash, purchasingUserAddress, txDetails],
    })

    const transactionHash = await BaseWalletClient.sendTransaction({
      to: CONTRACT_ADDRESS,
      data,
      account: ADMIN_ACCOUNT,
    })

    console.log('Smart contract logged influence rewards:', transactionHash)
  } catch (error) {
    console.error('Failed to log influence rewards on-chain:', error)
  }
}

const logDataUsagePreRewardEvent = async (
  batchId,
  walletAddress,
  userDataContributed,
  totalDataContributed,
) => {
  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'logTrainingDataUsage',
      args: [batchId, walletAddress, userDataContributed, totalDataContributed],
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

const logDataRecoPreRewardEvent = async (walletAddress) => {
  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'logRecommendationDataUsage',
      args: [walletAddress],
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
  logInfluencePreRewardEvent,
  logDataRecoPreRewardEvent,
  logDataUsagePreRewardEvent,
}
