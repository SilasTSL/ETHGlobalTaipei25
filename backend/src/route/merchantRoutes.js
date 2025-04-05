import express from 'express';
import * as merchantController from '../controller/merchantController.js';

const router = express.Router();

// Get all merchants
router.get('/', merchantController.getAllMerchants);

// Get a single merchant by ID
router.get('/:id', merchantController.getMerchantById);

// Create a new merchant
router.post('/', merchantController.createMerchant);

// Update a merchant
router.patch('/:id', merchantController.updateMerchant);

// Delete a merchant
router.delete('/:id', merchantController.deleteMerchant);

// Add a product to a merchant
router.post('/:id/products', merchantController.addProduct);

// Update a product in a merchant
router.patch('/:id/products/:productId', merchantController.updateProduct);

// Delete a product from a merchant
router.delete('/:id/products/:productId', merchantController.deleteProduct);

export default router; 