import dotenv from "dotenv"
import axios from "axios"

dotenv.config

const port = process.env.PORT || 3000

interface TransactionResponse {
  sourceAddress: string;
  destinationAddress: string;
  txHash: string;
}

interface TxDetails {
  merchantType?: string;
  merchantLocation?: string;
  transactionTitle?: string;
}

const postPurchasePaymentSameChain = async (
  destinationAddress: string,
  amount: number,
  chainsInvolved: string,
  tokenToTransfer: string,
): Promise<TransactionResponse> => {
  try {
    const txDetails = {
        "merchantType": "Food",
        "merchantLocation": "Singapore",
        "transactionTitle": "Wantonmee Bishan North - Meepok"
    }
    // Make the transaction request to your blockchain service
    const response = await axios.post(`http://localhost:${port}/payment-transfer/same-chain`, {
      destinationAddress,
      amount,
      chainsInvolved,
      tokenToTransfer,
      txDetails
    });

    const { sourceAddress, txHash } = response.data;
    
    // Validate the response
    if (!sourceAddress || !txHash) {
      throw new Error('Invalid transaction response');
    }

    return { sourceAddress, destinationAddress, txHash };
  } catch (error) {
    console.error('Error processing payment transaction:', error);
    throw new Error('Failed to process payment transaction');
  }
};

const postPurchasePaymentBridgeChain = async (
  destinationAddress: string,
  amount: number,
  chainsInvolved: string,
  tokenToTransfer: string,
): Promise<TransactionResponse> => {
  try {
    // Add validation for token type
    if (tokenToTransfer !== 'USDC') {
      throw new Error('Bridge transfers only support USDC token');
    }

    // Add validation for chains involved
    if (chainsInvolved !== 'BASE_ETH' && chainsInvolved !== 'ETH_BASE') {
      throw new Error('Bridge transfers only support BASE_ETH or ETH_BASE chains');
    }

    const txDetails = {
        "merchantType": "Food",
        "merchantLocation": "Singapore",
        "transactionTitle": "Wantonmee Bishan North - Meepok"
    }
    // Make the transaction request to your blockchain service
    console.log({
      destinationAddress,
      amount,
      chainsInvolved,
      tokenToTransfer,
      txDetails
    })
    const response = await axios.post(`http://localhost:${port}/payment-transfer/bridge`, {
      destinationAddress,
      amount,
      chainsInvolved,
      tokenToTransfer,
      txDetails
    });

    const { sourceAddress, txHash } = response.data;
    
    // Validate the response
    if (!sourceAddress || !txHash) {
      throw new Error('Invalid transaction response');
    }

    return { sourceAddress, destinationAddress, txHash };
  } catch (error) {
    console.error('Error processing payment transaction:', error);
    throw new Error('Failed to process payment transaction');
  }
};

export { postPurchasePaymentSameChain, postPurchasePaymentBridgeChain }