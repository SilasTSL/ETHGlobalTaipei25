import dotenv from 'dotenv'
import axios from 'axios'
import {
  createPublicClient,
  http,
  formatUnits,
  erc20Abi,
  getContract,
  formatEther,
} from 'viem'
import { mainnet } from 'viem/chains'

dotenv.config()

const EthereumPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_MAINNET),
})

const token = process.env.ONE_INCH_API_KEY

const walletAddress = '0xb76d3afB4AECe9f9916EB5e727B7472b609332dE'

const getBalance = async () => {
  try {
    const chain = 1
    const balanceUrl = `https://api.1inch.dev/balance/v1.2/${chain}/balances/${walletAddress}` //get
    const response = await axios.get(balanceUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    for (const [tokenAddress, balance] of Object.entries(response.data)) {
      if (balance === '0') {
        continue
      }
      if (tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        console.log(formatEther(BigInt(balance)))
        continue
      }
      const decimals = await EthereumPublicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      })
      console.log(tokenAddress, formatUnits(BigInt(balance), decimals))
    }
  } catch (error) {
    console.log(error)
  }
}

const getPrice = async () => {
  try {
    const chain = 1
    const addresses = [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    ]
    const priceUrl = `https://api.1inch.dev/price/v1.1/${chain}/${addresses}` //get
    const response = await axios.get(priceUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        addresses: addresses,
        currency: 'USD',
      },
    })

    console.log(response.data)
  } catch (error) {
    console.log(error)
  }
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

await getBalance()
await delay(1000)
await getPrice()
