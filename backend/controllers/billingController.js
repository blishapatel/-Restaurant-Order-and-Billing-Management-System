const mongoose = require('mongoose');
require('../models/User');
require('../models/Table');
require('../models/MenuItem');
require('../models/Category');
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Table = require('../models/Table');

const STAFF_FIELDS = 'name email phone role';
const orderPopulate = {
  path: 'orderId',
  populate: [
    { path: 'tableId', select: 'tableNumber capacity' },
    { path: 'waiterId', select: STAFF_FIELDS }
  ]
};

exports.generateBill = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(orderId).populate('tableId', 'tableNumber');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'served') {
      return res.status(400).json({ message: `Order must be served before billing (current: ${order.status})` });
    }

    if (!order.items?.length) {
      return res.status(400).json({ message: 'Order has no items' });
    }
    
    const existingBill = await Bill.findOne({ orderId: order._id });
    if (existingBill) return res.json(existingBill);

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const discount = req.body.discount || 0;
    const total = subtotal + cgst + sgst - discount;

    const tableNumber = order.tableId?.tableNumber ?? null;

    const bill = await Bill.create({
      orderId: order._id,
      tableNumber,
      subtotal,
      cgst,
      sgst,
      discount,
      total
    });
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.payBill = async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;
    const validMethods = ['Cash', 'Card', 'UPI', 'Razorpay'];
    if (!mongoose.Types.ObjectId.isValid(req.params.billId)) {
      return res.status(400).json({ message: 'Invalid bill id' });
    }
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Valid payment method is required' });
    }
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    
    // Apply discount if provided
    if (req.body.discount !== undefined) {
      bill.discount = req.body.discount;
      bill.total = bill.subtotal + bill.cgst + bill.sgst - bill.discount;
    }
    
    // Handle Razorpay payment differently
    if (paymentMethod === 'Razorpay') {
      // Check if this is a payment verification request (has payment details)
      if (paymentDetails && paymentDetails.razorpayPaymentId && paymentDetails.razorpayOrderId && paymentDetails.razorpaySignature) {
        // This is a payment verification request
        const razorpay = req.app.get('razorpay');
        
        if (!razorpay) {
          return res.status(500).json({ message: 'Razorpay not configured' });
        }
        
        try {
          // Verify the payment signature
          const verified = await razorpay.payments.fetch(paymentDetails.razorpayPaymentId);
          
          // Verify the signature
          const crypto = require('crypto');
          const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(paymentDetails.razorpayOrderId + '|' + paymentDetails.razorpayPaymentId)
            .digest('hex');
          
          if (expectedSignature !== paymentDetails.razorpaySignature) {
            return res.status(400).json({ message: 'Invalid Razorpay signature' });
          }
          
          // Payment is verified, complete the payment
          bill.paymentMethod = 'Razorpay';
          bill.paymentDetails = {
            razorpayPaymentId: paymentDetails.razorpayPaymentId,
            razorpayOrderId: paymentDetails.razorpayOrderId,
            razorpaySignature: paymentDetails.razorpaySignature,
            razorpayAmount: verified.amount,
            razorpayCurrency: verified.currency,
            razorpayStatus: verified.status,
            demo: false
          };
          bill.cashierId = req.user._id;
          bill.isPaid = true;
          bill.paidAt = new Date();

          const order = await Order.findById(bill.orderId).populate('tableId', 'tableNumber');
          if (order) {
            if (order.tableId?.tableNumber != null) {
              bill.tableNumber = order.tableId.tableNumber;
            }
            order.status = 'billed';
            await order.save();
            const tableRef = order.tableId?._id || order.tableId;
            if (tableRef) await Table.findByIdAndUpdate(tableRef, { status: 'available' });
          }
          await bill.save();

          const populated = await Bill.findById(bill._id)
            .populate(orderPopulate)
            .populate('cashierId', STAFF_FIELDS);

          res.json(populated);
          return;
        } catch (razorpayError) {
          console.error('Razorpay payment verification failed:', razorpayError);
          return res.status(500).json({ message: 'Failed to verify Razorpay payment', error: razorpayError.message });
        }
      } else {
        // This is a Razorpay order creation request
        const razorpay = req.app.get('razorpay');
        
        if (!razorpay) {
          return res.status(500).json({ message: 'Razorpay not configured' });
        }
        
        const options = {
          amount: Math.round(bill.total * 100), // amount in paise
          currency: 'INR',
          receipt: `receipt_${bill._id.toString()}`,
          payment_capture: 1
        };
        
        try {
          const razorpayOrder = await razorpay.orders.create(options);
          
          // Store Razorpay order details in bill
          bill.paymentMethod = 'Razorpay';
          bill.paymentDetails = {
            razorpayOrderId: razorpayOrder.id,
            razorpayAmount: razorpayOrder.amount,
            razorpayCurrency: razorpayOrder.currency,
            razorpayReceipt: razorpayOrder.receipt,
            demo: false
          };
          
          await bill.save();
          
          // Return Razorpay order details to frontend
          res.json({
            success: true,
            razorpayOrder: {
              id: razorpayOrder.id,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              key: process.env.RAZORPAY_KEY_ID,
              name: 'The Grand Table Restaurant',
              description: `Payment for bill #${bill._id.toString().slice(-6)}`,
              image: 'https://i.imgur.com/your-logo.png', // Replace with actual logo URL
              prefill: {
                name: 'Customer Name',
                email: 'customer@example.com',
                contact: '9999999999'
              },
              theme: {
                color: '#000000'
              }
            }
          });
          
          return;
        } catch (razorpayError) {
          console.error('Razorpay order creation failed:', razorpayError);
          return res.status(500).json({ message: 'Failed to create Razorpay order', error: razorpayError.message });
        }
      }
    }
    
    // For non-Razorpay methods, use existing logic
    bill.paymentMethod = paymentMethod;
    if (paymentDetails && typeof paymentDetails === 'object') {
      bill.paymentDetails = paymentDetails;
    } else if (paymentMethod === 'Cash') {
      bill.paymentDetails = { demo: true, transactionId: `CASH${Date.now().toString().slice(-8)}` };
    }
    bill.cashierId = req.user._id;
    bill.isPaid = true;
    bill.paidAt = new Date();

    const order = await Order.findById(bill.orderId).populate('tableId', 'tableNumber');
    if (order) {
      if (order.tableId?.tableNumber != null) {
        bill.tableNumber = order.tableId.tableNumber;
      }
      order.status = 'billed';
      await order.save();
      const tableRef = order.tableId?._id || order.tableId;
      if (tableRef) await Table.findByIdAndUpdate(tableRef, { status: 'available' });
    }
    await bill.save();

    const populated = await Bill.findById(bill._id)
      .populate(orderPopulate)
      .populate('cashierId', STAFF_FIELDS);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.billId)) {
      return res.status(400).json({ message: 'Invalid bill id' });
    }
    const bill = await Bill.findById(req.params.billId)
      .populate(orderPopulate)
      .populate('cashierId', STAFF_FIELDS);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBillByOrder = async (req, res) => {
  try {
    const bill = await Bill.findOne({ orderId: req.params.orderId })
      .populate(orderPopulate)
      .populate('cashierId', STAFF_FIELDS);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBillingHistory = async (req, res) => {
  try {
    const filter = { isPaid: true };

    if (req.query.date) {
      const parts = req.query.date.split('-').map(Number);
      if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const [year, month, day] = parts;
      const start = new Date(year, month - 1, day, 0, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59, 999);
      filter.paidAt = { $gte: start, $lte: end };
    }

    const bills = await Bill.find(filter)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'tableId', select: 'tableNumber capacity' },
          { path: 'waiterId', select: STAFF_FIELDS }
        ]
      })
      .populate('cashierId', STAFF_FIELDS)
      .sort({ paidAt: -1 })
      .lean();

    const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);

    for (const bill of bills) {
      if (bill.tableNumber == null && bill.orderId?.tableId?.tableNumber != null) {
        bill.tableNumber = bill.orderId.tableId.tableNumber;
        Bill.updateOne({ _id: bill._id }, { tableNumber: bill.tableNumber }).catch(() => {});
      }
    }

    res.json({
      date: req.query.date || null,
      totalOrders: bills.length,
      totalRevenue,
      bills
    });
  } catch (error) {
    console.error('getBillingHistory error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const toDateKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

exports.getAnalytics = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 7), 90);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const bills = await Bill.find({
      isPaid: true,
      paidAt: { $gte: start }
    })
      .populate({
        path: 'orderId',
        select: 'items tableId',
        populate: { path: 'tableId', select: 'tableNumber' }
      })
      .lean();

    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDateKey(d);
      dailyMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    const itemMap = {};
    const paymentMethods = { cash: 0, card: 0, upi: 0 };
    let totalRevenue = 0;

    bills.forEach((bill) => {
      const key = toDateKey(bill.paidAt);
      if (!dailyMap[key]) {
        dailyMap[key] = { date: key, revenue: 0, orders: 0 };
      }
      dailyMap[key].revenue += bill.total || 0;
      dailyMap[key].orders += 1;
      totalRevenue += bill.total || 0;

      const pm = (bill.paymentMethod || '').toLowerCase();
      if (pm === 'cash') paymentMethods.cash += 1;
      else if (pm === 'card') paymentMethods.card += 1;
      else if (pm === 'upi') paymentMethods.upi += 1;

      const items = bill.orderId?.items || [];
      items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].revenue += item.price * item.quantity;
      });
    });

    const dailyRevenue = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    const popularItems = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);

    res.json({
      days,
      totalRevenue,
      totalOrders: bills.length,
      averageOrderValue: bills.length ? totalRevenue / bills.length : 0,
      dailyRevenue,
      popularItems,
      paymentMethods
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.dailyReport = async (req, res) => {
  try {
    let start;
    let end;

    if (req.query.date) {
      const parts = req.query.date.split('-').map(Number);
      if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const [year, month, day] = parts;
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
      end = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    }

    const bills = await Bill.find({
      isPaid: true,
      paidAt: { $gte: start, $lte: end }
    })
      .populate(orderPopulate)
      .populate('cashierId', STAFF_FIELDS);

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
    const totalOrders = bills.length;
    const cashPayments = bills.filter(b => b.paymentMethod === 'Cash').length;
    const cardPayments = bills.filter(b => b.paymentMethod === 'Card').length;
    const upiPayments = bills.filter(b => b.paymentMethod === 'UPI').length;

    res.json({
      date: req.query.date || toDateKey(start),
      totalRevenue,
      totalOrders,
      paymentBreakdown: { cash: cashPayments, card: cardPayments, upi: upiPayments },
      bills
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
