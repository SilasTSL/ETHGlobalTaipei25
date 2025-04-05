import * as merchantService from '../service/merchantService.js';

/**
 * Get all merchants
 */
export const getAllMerchants = async (req, res) => {
  try {
    const merchants = await merchantService.getAllMerchants();
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a single merchant by ID
 */
export const getMerchantById = async (req, res) => {
  try {
    const merchant = await merchantService.getMerchantById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new merchant
 */
export const createMerchant = async (req, res) => {
  try {
    const newMerchant = await merchantService.createMerchant(req.body);
    res.status(201).json(newMerchant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Update a merchant
 */
export const updateMerchant = async (req, res) => {
  try {
    const updatedMerchant = await merchantService.updateMerchant(req.params.id, req.body);
    if (!updatedMerchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    res.json(updatedMerchant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a merchant
 */
export const deleteMerchant = async (req, res) => {
  try {
    const result = await merchantService.deleteMerchant(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    res.json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add a product to a merchant
 */
export const addProduct = async (req, res) => {
  try {
    const updatedMerchant = await merchantService.addProduct(req.params.id, req.body);
    if (!updatedMerchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    res.json(updatedMerchant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Update a product in a merchant
 */
export const updateProduct = async (req, res) => {
  try {
    const updatedMerchant = await merchantService.updateProduct(
      req.params.id,
      req.params.productId,
      req.body
    );
    if (!updatedMerchant) {
      return res.status(404).json({ message: 'Merchant or product not found' });
    }
    res.json(updatedMerchant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a product from a merchant
 */
export const deleteProduct = async (req, res) => {
  try {
    const updatedMerchant = await merchantService.deleteProduct(
      req.params.id,
      req.params.productId
    );
    if (!updatedMerchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    res.json(updatedMerchant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 