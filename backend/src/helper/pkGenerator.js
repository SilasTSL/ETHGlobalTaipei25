import { HDKey } from 'viem/accounts'
import { mnemonicToSeedSync } from 'bip39'

/**
 * Returns the first private key derived from the seed phrase (account 0).
 * @param {string} mnemonic - The BIP39 seed phrase.
 * @returns {string} - The hex private key.
 */
export function getFirstPrivateKey(mnemonic) {
  const seed = mnemonicToSeedSync(mnemonic)
  const hdKey = HDKey.fromMasterSeed(seed)
  const childKey = hdKey.derive(`m/44'/60'/0'/0/0`)
  // Convert the private key bytes to a hex string with 0x prefix
  return `${Array.from(childKey.privateKey)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`
}
