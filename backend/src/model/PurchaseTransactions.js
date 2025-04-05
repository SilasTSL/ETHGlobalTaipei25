import mongoose from 'mongoose'

const purchaseTransactionSchema = new mongoose.Schema(
  {
    userWalletAddress: {
      type: String,
      required: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true, // each transaction hash should be unique
    },
    blockchain: {
      type: String,
      required: true,
      enum: ['BASE', 'ETH'], // Supported blockchains
    },
  },
  {
    timestamps: true, // enable timestamps to add createdAt and updatedAt fields
  },
)

const PurchaseTransaction = mongoose.model(
  'PurchaseTransactions',
  purchaseTransactionSchema,
)

export default PurchaseTransaction
