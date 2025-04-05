import dotenv from 'dotenv'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { normalize } from 'viem/ens'

dotenv.config()

class EnsServiceProvider {
  constructor() {
    // Initialize clients for both mainnet and sepolia
    // this.mainnetClient = createPublicClient({
    //   chain: mainnet,
    //   transport: http(process.env.ETHEREUM_MAINNET),
    // })

    this.sepoliaClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.ETHEREUM_SEPOLA),
    })
  }

  /**
   * Resolves an ENS name to its corresponding Ethereum address
   * @param {string} ensName - The ENS name to resolve (e.g., 'vitalik.eth')
   * @param {Object} options - Optional parameters
   * @param {boolean} options.useSepolia - Whether to use Sepolia network instead of mainnet
   * @param {number} options.coinType - Optional coin type for resolution (e.g., 2147492101 for Base)
   * @returns {Promise<string|null>} - The resolved Ethereum address or null if not found
   */
  async resolveEnsName(ensName, options = {}) {
    try {
      const { useSepolia = false, coinType } = options

      const resolveOptions = {
        name: normalize(ensName),
      }

      // Add coinType to options if specified
      if (coinType) {
        resolveOptions.coinType = coinType
      }

      const address = await this.sepoliaClient.getEnsAddress(resolveOptions)
      return address
    } catch (error) {
      console.error(`Failed to resolve ENS name: ${error.message}`)
      return null
    }
  }
}

const EnsService = new EnsServiceProvider()

export { EnsService }
