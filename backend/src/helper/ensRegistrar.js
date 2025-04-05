import { parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { BaseWalletClient } from '../service/web3/init_web3.js'

import dotenv from 'dotenv'
dotenv.config()

const REGISTRAR_ADDRESS = process.env.REGISTRAR_ADDRESS // Replace with actual
const PRIVATE_KEY = process.env.MY_PRIVATE_KEY

const abi = parseAbi([
  'function register(string label, address owner) external',
])

const account = privateKeyToAccount(`0x${PRIVATE_KEY}`)

/**
 * Registers a new ENS name through the L2Registrar.
 * @param {string} label - ENS label (e.g., "alice" for "alice.eth")
 * @param {string} owner - Ethereum address to assign ownership to
 * @returns {Promise<string>} - Transaction hash
 */
export async function registerEnsName(label, owner) {
  const cleanAddress = REGISTRAR_ADDRESS.replace(/['"]/g, '')

  const txHash = await BaseWalletClient.writeContract({
    address: cleanAddress,
    abi,
    functionName: 'register',
    args: [label, owner],
    account,
  })

  return txHash
}
