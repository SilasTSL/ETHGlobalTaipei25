import axios from 'axios';
import dotenv from 'dotenv';
import Web3 from 'web3';
import fs from 'fs';

dotenv.config();

// Nodit API configuration
const NODIT_API_KEY = process.env.NODIT_API_KEY;
const NODIT_BASE_URL = 'https://web3.nodit.io/v1/base/sepolia';
const NODIT_ETH_BASE_URL = 'https://web3.nodit.io/v1/ethereum/sepolia';
const POST_REWARD_CONTRACT_ADDRESS = process.env.POST_CONTRACT_ADDRESS;

const web3 = new Web3();

const preRewardsABI = JSON.parse(fs.readFileSync('./contract/PreRewardsABI.json'));
const postRewardsABI = JSON.parse(fs.readFileSync('./contract/PostRewardsABI.json'));

const functionSelectorMappingPre = {
  "0x1c06f477": "distributeDataRecommendationRewards",
  "0x381da92a": "distributeInfluenceRewards",
  "0x0ea4170a": "distributeDataTrainingRewards"
}

const functionSelectorMappingPost = {
  "0x88e7a709": "distributeDataRecommendationRewards",
  "0xfcdb401e": "distributeInfluenceRewards",
  "0xfefddfd2": "distributeDataTrainingRewards"
}


const decodeTransactionInput = (input, contractABI) => {
    try {
      // Get the function signature (first 4 bytes)
      const functionSignature = input.slice(0, 10);
      
      // Find matching function in ABI
      const functionAbi = contractABI.find(item => 
        item.type === 'function' && 
        functionSignature === web3.eth.abi.encodeFunctionSignature(item)
      );
  
      if (!functionAbi) {
        throw new Error('Function not found in ABI');
      }
  
      // Decode parameters (works in all Web3.js versions)
      const params = web3.eth.abi.decodeParameters(
        functionAbi.inputs,
        '0x' + input.slice(10)
      );

      console.log("Decoded input:", params)
  
      return {
        name: functionAbi.name,
        args: Object.values(params) // Convert to array
      };
    } catch (error) {
      console.error("Decoding failed:", error);
      return null;
    }
};
  
const decodePreRewardInput = (input) => {
  return decodeTransactionInput(input, preRewardsABI);
};

const decodePostRewardInput = (input) => {
  return decodeTransactionInput(input, postRewardsABI);
};

function deepConvertBigInt(obj) {
  const newObj = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'bigint') {
      newObj[key] = value.toString();
    } else if (typeof value === 'object' && value !== null) {
      newObj[key] = deepConvertBigInt(value);
    } else {
      newObj[key] = value;
    }
  }
  
  return newObj;
}

async function getTransactionAmount(hash) {
  try {
    if (!hash) {
      console.error("No hash provided");
      return 0;
  }
  const options = {
    method: 'POST',
    url: `${NODIT_ETH_BASE_URL}/blockchain/getTransactionByHash`,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'X-API-KEY': NODIT_API_KEY
    },
    data: {
      transactionHash: hash,
      withLogs: false,
      withDecode: false
    }
  };

    const response = await axios.request(options);
    const etherValue = web3.utils.fromWei(response.data.value, 'ether');
    return etherValue;
  } catch (error) {
    console.error('Error in getTransactionAmount:', error);
    return 0;
  }
}

/**
 * Fetches transactions for a specific address from the blockchain
 */
export const queryPostTransactionsForUser = async (userAddress, fromBlock, toBlock, withCount = false) => {
  try {
    console.log("Querying post transactions for user:", userAddress)
    // Prepare the request options
    const options = {
      method: 'POST',
      url: `${NODIT_BASE_URL}/blockchain/getTransactionsByAccount`,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-KEY': NODIT_API_KEY
      },
      data: {
        accountAddress: POST_REWARD_CONTRACT_ADDRESS,
        fromBlock: fromBlock || '0',
        toBlock: toBlock || 'latest',
        withCount,
        withLogs: false,
        withDecode: false,
        relation: 'to'
      }
    };

    // Get all transactions to post smart contract
    const response = await axios.request(options);
    const allTransactions = response.data.items;

    // Add function type and decoded input to each
    const fullTransactions = allTransactions.map(tx => {
      const decodedInput = decodePostRewardInput(tx.input);
      const sanitizedDecodedInput = deepConvertBigInt(decodedInput);
      const functionType = functionSelectorMappingPost[tx.functionSelector];
      return {...tx, decodedInput: sanitizedDecodedInput, functionType};
    });

    // Filter all transactions to post rewards smart contract to only include those relevant to the user
    const filteredTransactions = fullTransactions.filter(tx => {
      if (tx.functionType === 'distributeDataRecommendationRewards') {
        tx.rewardHash = tx.decodedInput.args[1];
        return tx.decodedInput.args[0].toLowerCase() == userAddress.toLowerCase();
      } else if (tx.functionType === 'distributeDataTrainingRewards') {
        tx.rewardHash = tx.decodedInput.args[4];
        return tx.decodedInput.args[1].toLowerCase() == userAddress.toLowerCase();
      } else if (tx.functionType === 'distributeInfluenceRewards') {
        tx.rewardHash = tx.decodedInput.args[0];
        return tx.decodedInput.args[3].some(addr => 
          addr.toLowerCase() === userAddress.toLowerCase()
        );
      } else {
        console.log('Unknown function type:', tx.functionType)
      }
      return false;
    });

    const transactionsWithRewardAmount = []
    for (const tx of filteredTransactions) {
      let txRewardAmount = 0;
      if (tx.functionType === 'distributeInfluenceRewards') {
        txRewardAmount = await getTransactionAmount(tx.decodedInput.args[5][tx.decodedInput.args[3].indexOf(userAddress)])
      } else {
        txRewardAmount = await getTransactionAmount(tx.rewardHash)
      }
      transactionsWithRewardAmount.push({ txHash: tx.transactionHash, rewardHash: tx.rewardHash, decodedInput: tx.decodedInput, functionType: tx.functionType, date: new Date(tx.timestamp * 1000).toLocaleString(), rewardAmount: txRewardAmount })
    }

    return transactionsWithRewardAmount;

  } catch (error) {
    console.error('Error in dataVaultService:', error);
    throw error;
  }
};

export const getTransactionFromTransactionHash = async (transactionHash) => {
  if (!transactionHash) {
    return null;
  }

  try {
    const options = {
      method: 'POST',
            url: `${NODIT_BASE_URL}/blockchain/getTransactionByHash`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'X-API-KEY': NODIT_API_KEY,
            },
            data: {
                transactionHash: transactionHash,
                withLogs: true,
                withDecode: true,
            }
        };

        const response = await axios.request(options);
        const decodedInput = decodePreRewardInput(response.data.input);
        const functionType = functionSelectorMappingPre[response.data.functionSelector]
        return {...response.data, decodedInput, functionType};
    } catch (error) {
        console.error('Error in getTransactionFromTransactionHash:', error);
        throw error;
    }
}
