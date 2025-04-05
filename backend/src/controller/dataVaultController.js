import { queryPostTransactionsForUser, getTransactionFromTransactionHash } from '../service/web3/noditDataQueries.js';

/**
 * Get transactions for a specific address
 */
export const getPostTransactionsForUser = async (req, res) => {
  try {
    const { userAddress, fromBlock, toBlock, withCount = false } = req.query;

    if (!userAddress) {
      return res.status(400).json({ 
        message: 'userAddress parameter is required' 
      });
    }

    const transactions = await queryPostTransactionsForUser(
      userAddress,
      fromBlock,
      toBlock,
      withCount
    );

    res.json({
      success: true,
      data: transactions,
    });

  } catch (error) {
    console.error('Error in dataVaultController:', error);
    
    // Handle specific error cases
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Error fetching transactions',
        error: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'No response received from blockchain data service'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error setting up the request'
      });
    }
  }
};


/**
 * Get transaction details for a specific transaction hash
 */
export const getTransactionDetails = async (req, res) => {
  try {

    const transactionHash = req.params['transactionHash'];

    if (!transactionHash) {
      return res.status(400).json({
        message: 'transactionHash parameter is required'
      });
    }

    const transactionDetails = await getTransactionFromTransactionHash(transactionHash);

    res.json(transactionDetails);

  } catch (error) {
    console.error('Error in dataVaultController:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction details'
    });
  }
};


/**
 * Get post rewards data vault transactions for a specific user
 * 
 */
export const getPostRewardsDataVaultTransactions = async (req, res) => {
  try {
    const { userAddress } = req.query;

    if (!userAddress) {
      return res.status(400).json({
        message: 'userAddress parameter is required'
      });
    }



  } catch (error) {
    console.error('Error in dataVaultController:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post rewards data vault transactions'
    });
  }
}
