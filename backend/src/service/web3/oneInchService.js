import dotenv from 'dotenv'
import axios from 'axios'
import {
  createPublicClient,
  http,
  formatUnits,
  erc20Abi,
  formatEther,
} from 'viem'
import { mainnet, base } from 'viem/chains'
import { Decimal } from 'decimal.js'

dotenv.config()

const CHAIN_MAPPING = {
  ETH: mainnet.id,
  BASE: base.id,
}

const PROVIDER_MAPPING = {
  ETH: process.env.ETHEREUM_MAINNET,
  BASE: process.env.BASE_MAINNET,
}

const TOKEN_SYMBOL_TO_MAINNET_MAPPING = {
  ETH: {
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    LSS: '0x3B9BE07d622aCcAEd78f479BC0EDabFd6397E320',
  },
  BASE: {
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  },
}

const ONE_INCH_TOKEN_NAME_MAPPING_TO_SYMBOL = {
  Eth: 'ETH',
  'USD Coin': 'USDC',
  'Lossless Token': 'LSS',
}

class OneInchServiceProvider {
  chain
  mainNetPublicClient
  apiKey

  constructor(apiKey) {
    this.apiKey = apiKey
  }
  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  async getTokenPricesForBlockchain(blockchain) {
    const tokenAddresses = Object.values(
      TOKEN_SYMBOL_TO_MAINNET_MAPPING[blockchain],
    )
    return this.getTokenPrices(tokenAddresses, blockchain)
  }

  async getTokenPrices(tokenAddresses, blockchain) {
    try {
      const priceUrl = `https://api.1inch.dev/price/v1.1/${CHAIN_MAPPING[blockchain]}/${tokenAddresses}`

      const response = await axios.get(priceUrl, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        params: { currency: 'USD' },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch token prices:', {
        tokenAddresses,
        blockchain,
        statusCode: error?.response?.status,
        message: error?.response?.data?.message || error.message,
      })
      return {}
    }
  }

  async getBalance(walletAddress, blockchain) {
    try {
      if (!blockchain || !(blockchain in CHAIN_MAPPING)) {
        throw new Error(
          `Invalid blockchain. Must be one of: ${Object.keys(CHAIN_MAPPING).join(', ')}`,
        )
      }
      const balanceUrl = `https://api.1inch.dev/balance/v1.2/${CHAIN_MAPPING[blockchain]}/balances/${walletAddress}`
      const response = await axios.get(balanceUrl, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      const tokenAddressesWithAmount = Object.entries(response.data).filter(
        ([_, amount]) => amount !== '0',
      )

      await this.delay(1000) //NOTE: TO deal with RATE LIMITING BY ONEINCH
      const tokenPrices = await this.getTokenPrices(
        tokenAddressesWithAmount.map(([address]) => address),
        blockchain,
      )
      const walletBalance = []

      const mainNetPublicClient = createPublicClient({
        chain: CHAIN_MAPPING[blockchain],
        transport: http(PROVIDER_MAPPING[blockchain]),
      })
      // Using for...of with entries to include index
      for (const [
        index,
        [tokenContractAddress, balance],
      ] of tokenAddressesWithAmount.entries()) {
        if (balance === '0') {
          continue
        }
        let tokenName, price, amount
        if (
          tokenContractAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        ) {
          amount = formatEther(BigInt(balance))
          tokenName = 'Eth'
        } else {
          const decimals = await mainNetPublicClient.readContract({
            address: tokenContractAddress,
            abi: erc20Abi,
            functionName: 'decimals',
          })
          tokenName = await mainNetPublicClient.readContract({
            address: tokenContractAddress,
            abi: erc20Abi,
            functionName: 'name',
          })
          amount = formatUnits(BigInt(balance), decimals)
        }
        walletBalance.push({
          name: ONE_INCH_TOKEN_NAME_MAPPING_TO_SYMBOL[tokenName],
          symbol: ONE_INCH_TOKEN_NAME_MAPPING_TO_SYMBOL[tokenName],
          contractAddress: tokenContractAddress,
          balance: parseFloat(amount),
          price: tokenPrices[tokenContractAddress],
          totalValue:
            parseFloat(amount) * parseFloat(tokenPrices[tokenContractAddress]),
        })
      }
      return walletBalance
    } catch (error) {
      console.error('Failed to fetch wallet balances:', {
        blockchain,
        walletAddress,
        statusCode: error?.response?.status,
        message: error?.response?.data?.message || error.message,
      })
      return []
    }
  }

  async getTokenAmountForUSD(usdAmount, tokenSymbol, blockchain) {
    try {
      const tokenAddress =
        TOKEN_SYMBOL_TO_MAINNET_MAPPING[blockchain][tokenSymbol.toUpperCase()]
      const price = (await this.getTokenPrices([tokenAddress], blockchain))[
        tokenAddress
      ]
      if (price === 0) {
        throw new Error('Price not available for the given token.')
      }
      return new Decimal(usdAmount).dividedBy(price).toNumber()
    } catch (error) {
      console.error('Failed to calculate token amount:', {
        blockchain,
        tokenSymbol,
        usdAmount,
        statusCode: error?.response?.status,
        message: error?.response?.data?.message || error.message,
      })
      return 0
    }
  }

  async getGasPrice(blockchain) {
    try {
      const gasPriceUrl = `https://api.1inch.dev/gas-price/v1.5/${CHAIN_MAPPING[blockchain]}`
      const response = await axios.get(gasPriceUrl, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch gas prices:', {
        blockchain,
        statusCode: error?.response?.status,
        message: error?.response?.data?.message || error.message,
      })
      return null
    }
  }
}

// LINKS TO ETHEREUM MAINNET
const OneInchEthereumService = new OneInchServiceProvider(
  process.env.ONE_INCH_API_KEY,
)

export { OneInchEthereumService }
