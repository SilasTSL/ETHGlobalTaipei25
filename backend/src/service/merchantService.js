import Merchant from '../model/Merchant.js';

/**
 * Get all merchants from the database
 */
export const getAllMerchants = async () => {
  return await Merchant.find();
};

/**
 * Get a single merchant by ID
 */
export const getMerchantById = async (id) => {
  return await Merchant.findById(id);
};

/**
 * Create a new merchant
 */
export const createMerchant = async (merchantData) => {
  const merchant = new Merchant({
    merchantType: merchantData.merchantType,
    merchantLocation: merchantData.merchantLocation,
    products: merchantData.products
  });
  return await merchant.save();
};

/**
 * Update a merchant
 */
export const updateMerchant = async (id, updateData) => {
  const merchant = await Merchant.findById(id);
  if (!merchant) {
    return null;
  }

  if (updateData.merchantType) {
    merchant.merchantType = updateData.merchantType;
  }
  if (updateData.merchantLocation) {
    merchant.merchantLocation = updateData.merchantLocation;
  }
  if (updateData.products) {
    merchant.products = updateData.products;
  }

  return await merchant.save();
};

/**
 * Delete a merchant
 */
export const deleteMerchant = async (id) => {
  const merchant = await Merchant.findById(id);
  if (!merchant) {
    return null;
  }
  return await merchant.deleteOne();
};

/**
 * Add a product to a merchant
 */
export const addProduct = async (merchantId, productData) => {
  const merchant = await Merchant.findById(merchantId);
  if (!merchant) {
    return null;
  }

  merchant.products.push({
    productTitle: productData.productTitle,
    amount: productData.amount
  });

  return await merchant.save();
};

/**
 * Update a product in a merchant
 */
export const updateProduct = async (merchantId, productId, updateData) => {
  const merchant = await Merchant.findById(merchantId);
  if (!merchant) {
    return null;
  }

  const product = merchant.products.id(productId);
  if (!product) {
    return null;
  }

  if (updateData.productTitle) {
    product.productTitle = updateData.productTitle;
  }
  if (updateData.amount !== undefined) {
    product.amount = updateData.amount;
  }

  return await merchant.save();
};

/**
 * Delete a product from a merchant
 */
export const deleteProduct = async (merchantId, productId) => {
  const merchant = await Merchant.findById(merchantId);
  if (!merchant) {
    return null;
  }

  merchant.products = merchant.products.filter(
    product => product._id.toString() !== productId
  );

  return await merchant.save();
}; 