import express from 'express'
import { OneInchEthereumService } from '../service/web3/oneInchService.js'
import { NodditService } from '../service/web3/nodditService.js'
import sessionMiddleware from '../middleware/session.js'
const router = express.Router()

const TESTNET_TOKEN_TO_MAINNET_TOKEN_MAPPING = {
  '0x036cbd53842c5426634e7929541ec2318f3dcf7e':
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', //USDC ON BASE
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee':
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', //ETH
  '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238':
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //USDC ON ETH
}

router.use(sessionMiddleware)

// Route to get wallet balance on mainnet
router.get('/balance', async (req, res) => {
  try {
    console.log(req.session)
    const { address: walletAddress } = req.session.user
    const { blockchain } = req.query
    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress is required' })
    }

    const isMainnet = process.env.USE_MAINNET === 'true'
    let balance

    if (isMainnet) {
      balance = await OneInchEthereumService.getBalance(
        walletAddress,
        blockchain,
      )
    } else {
      balance = await NodditService.getWalletBalance(walletAddress, blockchain)

      const tokenPricesMapping =
        await OneInchEthereumService.getTokenPricesForBlockchain(blockchain)

      balance.forEach((b) => {
        const mainnetTokenAddress =
          TESTNET_TOKEN_TO_MAINNET_TOKEN_MAPPING[b.contractAddress]
        const tokenPrice = tokenPricesMapping[mainnetTokenAddress]
        b.price = tokenPrice
        b.totalValue = b.balance * tokenPrice
      })
    }

    res.status(200).json({ balance })
  } catch (error) {
    console.log('Error fetching balance:', error)
    res
      .status(500)
      .json({ error: 'Error fetching balance', details: error.message })
  }
})

// Route to get token amount for a given USD value
router.get('/token-amount', async (req, res) => {
  try {
    const { usdAmount, tokenSymbol, blockchain } = req.query
    if (!usdAmount || !tokenSymbol) {
      return res
        .status(400)
        .json({ error: 'usdAmount and tokenAddress are required' })
    }

    const tokenAmount = await OneInchEthereumService.getTokenAmountForUSD(
      usdAmount,
      tokenSymbol,
      blockchain,
    )
    res.status(200).json({ tokenAmount })
  } catch (error) {
    res.status(500).json({
      error: 'Error calculating token amount',
      tokenAmount: 0,
    })
  }
})

// Route to get latest transactions
router.get('/latest-transactions', async (req, res) => {
  try {
    const { address: walletAddress } = req.session.user
    const { blockchain } = req.query

    const transactions = await NodditService.fetchLatestPurchaseTransactions(
      walletAddress,
      blockchain,
    )
    res.status(200).json({ transactions })
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching transactions',
      transactions: [],
    })
  }
})

//TODO: To integrate with test net also to get gas prices
router.get('/gas-price', async (req, res) => {
  try {
    const { blockchain } = req.query

    const gasPrice = await OneInchEthereumService.getGasPrice(blockchain)
    res.status(200).json({ gasPrice })
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching transactions',
      transactions: [],
    })
  }
})

export default router
