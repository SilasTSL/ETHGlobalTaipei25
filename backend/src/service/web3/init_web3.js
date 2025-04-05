import { createPublicClient, createWalletClient, http } from 'viem'
import { sepolia, baseSepolia } from 'viem/chains'
import dotenv from 'dotenv'

dotenv.config()

const EthereumPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.ETHEREUM_SEPOLA),
})

const EthereumWalletClient = createWalletClient({
  chain: sepolia,
  transport: http(process.env.ETHEREUM_SEPOLA),
})

const BasePublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLA),
})

const BaseWalletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLA),
})

export {
  EthereumPublicClient,
  EthereumWalletClient,
  BasePublicClient,
  BaseWalletClient,
}
