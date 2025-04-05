import express from 'express';
import * as dataVaultController from '../controller/dataVaultController.js';

const router = express.Router();

/**
 * @route GET /data-vault/transactions
 * @query {string} userAddress - The Ethereum address to get transactions for
 * @query {number} [fromBlock] - The starting block number
 * @query {number} [toBlock] - The ending block number
 * @query {boolean} [withCount=false] - Include transaction count
 */
router.get('/transactions', dataVaultController.getPostTransactionsForUser);

/**
 * @route GET /data-vault/transaction/:transactionHash
 * @param {string} transactionHash - The transaction hash to get details for
 */
router.get('/transaction/:transactionHash', dataVaultController.getTransactionDetails);

export default router;