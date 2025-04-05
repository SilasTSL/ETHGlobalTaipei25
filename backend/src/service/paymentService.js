import EthereumService from './web3/ethereumService.js'
import BaseService from './web3/baseService.js'
import {
  UsdcEthToBaseBridgingService,
  UsdcBaseToEthBridgingService,
} from './web3/usdcBridgingService.js'
import USDCPaymasterService from './web3/usdcPaymasterService.js'

const sameChainServiceMapping = {
  ETH_ETH: {
    service: EthereumService,
    supportedTokens: new Set(['ETH', 'USDC']),
  },
  BASE_BASE: {
    service: BaseService,
    supportedTokens: new Set(['ETH', 'USDC']),
  },
  BASE_BASE_CIRCLEMASTER: {
    service: USDCPaymasterService,
    supportedTokens: new Set(['USDC']),
  },
}

const bridgeServiceMapping = {
  BASE_ETH: {
    service: UsdcBaseToEthBridgingService,
    supportedTokens: new Set(['USDC']),
  },
  ETH_BASE: {
    service: UsdcEthToBaseBridgingService,
    supportedTokens: new Set(['USDC']),
  },
}

export const sendPaymentTransaction = async (
  destinationAddress,
  amount,
  chainsInvolved,
  tokenToTransfer,
  privateKey,
) => {
  try {
    const serviceConfig = sameChainServiceMapping[chainsInvolved]
    if (!serviceConfig) {
      throw new Error('Invalid chainType for same-chain transaction')
    }
    if (!serviceConfig.supportedTokens.has(tokenToTransfer)) {
      throw new Error('Invalid token specified for transaction')
    }
    let transactionDetails
    if (chainsInvolved == 'BASE_BASE_CIRCLEMASTER') {
      transactionDetails = await serviceConfig.service.sendPaymentTransaction(
        destinationAddress,
        amount,
        privateKey,
      )
    } else {
      transactionDetails = await serviceConfig.service.sendPaymentTransaction(
        destinationAddress,
        amount,
        tokenToTransfer,
        privateKey,
      )
    }
    const { sourceAddress, txHash } = transactionDetails
    return { sourceAddress, txHash }
  } catch (error) {
    throw new Error(`Failed to send same-chain transaction: ${error.message}`)
  }
}

export const sendBridgePaymentTransaction = async (
  destinationAddress,
  amount,
  chainsInvolved,
  TokenToTransfer,
  privateKey,
) => {
  try {
    const serviceConfig = bridgeServiceMapping[chainsInvolved]
    if (!serviceConfig) {
      throw new Error('Invalid chainsInvolved for bridge transaction')
    }
    if (!serviceConfig.supportedTokens.has(TokenToTransfer)) {
      throw new Error('Invalid token specified for bridge transaction')
    }

    const transactionDetails =
      await serviceConfig.service.sendPaymentTransaction(
        destinationAddress,
        amount,
        privateKey,
      )
    const { sourceAddress, txHash, mintTxHash } = transactionDetails
    return { sourceAddress, txHash, mintTxHash }
  } catch (error) {
    throw new Error(`Failed to send bridge transaction: ${error.message}`)
  }
}
