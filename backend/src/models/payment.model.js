const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  }],
  items: [{
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    label: {
      type: String,
      default: null,
      trim: true
    }
  }],
  xenditInvoiceId: {
    type: String
  },
  invoiceUrl: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'SETTLED', 'EXPIRED', 'FAILED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);