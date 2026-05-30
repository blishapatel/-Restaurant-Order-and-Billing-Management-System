const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  tableNumber: { type: Number },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subtotal: { type: Number, required: true },
  cgst: { type: Number, required: true },
  sgst: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Razorpay'] },
  paymentDetails: {
    demo: { type: Boolean, default: true },
    transactionId: String,
    cardHolder: String,
    cardLast4: String,
    cardBrand: String,
    expiry: String,
    upiId: String,
    upiApp: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    gateway: String,
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
