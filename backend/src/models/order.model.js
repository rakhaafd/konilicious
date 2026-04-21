const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  label: { type: String, default: null, trim: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['WAITING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
      default: 'WAITING',
    },
    statusTimestamps: {
      WAITING: { type: Date, default: Date.now },
      PROCESSING: { type: Date },
      COMPLETED: { type: Date },
      CANCELLED: { type: Date },
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    xenditInvoiceId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);