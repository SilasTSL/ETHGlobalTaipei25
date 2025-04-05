import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productTitle: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const merchantSchema = new mongoose.Schema({
  merchantType: {
    type: String,
    required: true,
    trim: true,
    enum: ['Food', 'Electronics', 'Fashion', 'Health', 'Other'] // Add more types as needed
  },
  merchantLocation: {
    type: String,
    required: true,
    trim: true
  },
  products: [productSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
merchantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Merchant = mongoose.model('Merchant', merchantSchema);

export default Merchant; 