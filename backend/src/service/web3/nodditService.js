import axios from 'axios'
import dotenv from 'dotenv'
import { formatUnits } from 'viem'
import PurchaseTransaction from '../../model/PurchaseTransactions.js'

dotenv.config()
const NODIT_API_KEY = process.env.NODIT_API_KEY

const CHAIN_MAPPING = {
  ETH: {
    protocol: 'ethereum',
    network: 'sepolia',
    tokenContractAddresses: ['0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'],
  },
  BASE: {
    protocol: 'base',
    network: 'sepolia',
    tokenContractAddresses: ['0x036CbD53842c5426634e7929541eC2318f3dCF7e'],
  },
}

class NodditServiceProvider {
  async getNativeBalance(walletAddress, blockchain) {
    const { protocol, network } = CHAIN_MAPPING[blockchain]
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/native/getNativeBalanceByAccount`

    const response = await axios.post(
      url,
      { accountAddress: walletAddress },
      {
        headers: {
          'X-API-KEY': NODIT_API_KEY,
          accept: 'application/json',
          'content-type': 'application/json',
        },
      },
    )
    return response.data
  }

  async getERC20Balance(walletAddress, blockchain) {
    const { protocol, network, tokenContractAddresses } =
      CHAIN_MAPPING[blockchain]
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokensOwnedByAccount`
    const response = await axios.post(
      url,
      {
        accountAddress: walletAddress,
        contractAddresses: tokenContractAddresses,
        withCount: false,
      },
      {
        headers: {
          'X-API-KEY': NODIT_API_KEY,
          accept: 'application/json',
          'content-type': 'application/json',
        },
      },
    )
    return response.data
  }

  async getWalletBalance(walletAddress, blockchain) {
    const nativeBalance = await this.getNativeBalance(walletAddress, blockchain)
    const erc20Tokens = await this.getERC20Balance(walletAddress, blockchain)
    const formattedBalances = []

    formattedBalances.push({
      name: 'ETH',
      symbol: 'ETH',
      contractAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      balance: Number(formatUnits(BigInt(nativeBalance.balance), 18)),
    })

    if (erc20Tokens.items) {
      erc20Tokens.items.forEach((token) => {
        formattedBalances.push({
          name: token.contract.name,
          symbol: token.contract.symbol,
          contractAddress: token.contract.address.toLowerCase(),
          balance: Number(
            formatUnits(BigInt(token.balance), token.contract.decimals),
          ),
        })
      })
    }

    return formattedBalances
  }

  async fetchTokenContractData(contractAddresses, blockchain) {
    try {
      const { protocol, network } = CHAIN_MAPPING[blockchain]
      const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokenContractMetadataByContracts`
      const response = await axios.post(
        url,
        {
          contractAddresses: contractAddresses,
        },
        {
          headers: {
            'X-API-KEY': NODIT_API_KEY,
            accept: 'application/json',
            'content-type': 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.log(error.response.data)
    }
  }

  async fetchLatestPurchaseTransactions(walletAddress, blockchain) {
    try {
      // Get the latest 5 transactions (instead of 3) to account for potential missing ones
      const purchaseTransactions = await PurchaseTransaction.find({
        userWalletAddress: walletAddress,
        blockchain: blockchain,
      })
        .select('txHash')
        .sort({ createdAt: -1 })
        .limit(5)
      const { protocol, network, tokenContractAddresses } =
        CHAIN_MAPPING[blockchain]
      const usdcContractAddress = tokenContractAddresses[0] //HARDCODED SINCE WE ONLY SUPPORT USDC
      const url = `https://web3.nodit.io/v1/${protocol}/${network}/blockchain/getTransactionByHash`
      const transactionDetails = []

      // Fetch details for each transaction until we have 3 or run out of transactions
      for (const transaction of purchaseTransactions) {
        if (transactionDetails.length >= 3) break

        const { txHash } = transaction
        try {
          const response = await axios.post(
            url,
            {
              transactionHash: txHash,
              withLogs: true,
            },
            {
              headers: {
                'X-API-KEY': NODIT_API_KEY,
                accept: 'application/json',
                'content-type': 'application/json',
              },
            },
          )
          const {
            transactionHash,
            gasUsed,
            from,
            logs,
            effectiveGasPrice,
            timestamp,
          } = response.data

          let value, sourceAddress, destinationAddress, symbol

          if (logs && logs.length > 0 && logs[0].topics) {
            // This is an ERC20 transfer
            value = formatUnits(BigInt(parseInt(logs[0].data, 16)), 6)
            const [, rawSourceAddress, rawDestinationAddress] = logs[0].topics
            sourceAddress = '0x' + rawSourceAddress.slice(-40)
            destinationAddress = '0x' + rawDestinationAddress.slice(-40)
            symbol = 'USDC'
          } else {
            // This is a native ETH transfer
            value = formatUnits(BigInt(response.data.value), 18) // Native ETH has 18 decimals
            sourceAddress = response.data.from
            destinationAddress = response.data.to
            symbol = 'ETH'
          }

          const gasCostWei = BigInt(gasUsed) * BigInt(effectiveGasPrice)
          const gasCostEth = Number(formatUnits(gasCostWei, 18)) // Convert to ETH
          const date = new Date(timestamp * 1000) // Convert Unix timestamp to Date object
          const taipeiTime = date.toLocaleString('en-US', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })

          transactionDetails.push({
            transactionHash,
            sourceAddress: from,
            destinationAddress,
            value: parseFloat(value).toFixed(6),
            symbol,
            gasCostEth,
            timestamp: taipeiTime, // Taipei time
          })
        } catch (error) {
          // If transaction not found, continue to next one
          if (error.response?.data?.code === 'RESOURCE_NOT_FOUND') {
            console.log(`Transaction ${txHash} not yet available in Noddit`)
            continue
          }
          throw error // Re-throw if it's a different error
        }
      }

      return transactionDetails
    } catch (error) {
      console.error('Error fetching transaction details:', error.response)
      throw error
    }
  }
}

// Initialize and export instance
const NodditService = new NodditServiceProvider()
export { NodditService }
