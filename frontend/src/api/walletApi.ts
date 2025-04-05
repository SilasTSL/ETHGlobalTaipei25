import dotenv from "dotenv"

import axios from "axios"

dotenv.config

const port = process.env.PORT || 3000

const DEFAULT_WALLET_ADDRESS = '0x94e0c8b1c540eb2f00Fb000320357AE591e5C262'


const fetchWalletBalanceTestNet = async (blockchain: string) => {
  try {
    const response = await axios.get(`http://localhost:${port}/wallet/balance`, {
      params: {
        walletAddress: DEFAULT_WALLET_ADDRESS,
        blockchain
      }
    });
    const { balance } = response.data
    return balance;
  } catch (error) {
    console.error('Error fetching testnet wallet balance:', error);
    throw new Error('Failed to fetch testnet wallet balance');
  }
}

const fetchAmountOfCryptoToTransfer = async (usdAmount: string, tokenSymbol: string, blockchain: string) => {
  try {
    const response = await axios.get(`http://localhost:${port}/wallet/token-amount`, {
      params: {
        usdAmount,
        tokenSymbol,
        blockchain
      }
    });
    const { tokenAmount } = response.data
    return tokenAmount;
  } catch (error) {
    console.error('Error fetching crypto transfer amount:', error);
    throw new Error('Failed to fetch crypto transfer amount');
  }
}

const fetchLatestTransactions = async (blockchain: string) => {
  try {
    const response = await axios.get(`http://localhost:${port}/wallet/latest-transactions`, {
      params: {
        walletAddress: DEFAULT_WALLET_ADDRESS,
        blockchain
      }
    });
    const { transactions } = response.data
    return transactions;
  } catch (error) {
    console.error('Error fetching crypto transfer amount:', error);
    throw new Error('Failed to fetch crypto transfer amount');
  }
}

  export { fetchWalletBalanceTestNet, fetchAmountOfCryptoToTransfer, fetchLatestTransactions }