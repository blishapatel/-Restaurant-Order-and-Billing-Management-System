const Order = require('../models/Order');
const Table = require('../models/Table');

const STAFF_FIELDS = 'name email phone role';

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body;
    const order = await Order.create({
      tableId,
      waiterId: req.user._id,
      items,
      status: 'pending'
    });
    await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
    const populated = await order.populate([
      { path: 'tableId', select: 'tableNumber' },
      { path: 'waiterId', select: STAFF_FIELDS }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('tableId', 'tableNumber')
      .populate('waiterId', STAFF_FIELDS)
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('tableId', 'tableNumber capacity')
      .populate('waiterId', STAFF_FIELDS);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('tableId', 'tableNumber').populate('waiterId', STAFF_FIELDS);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addItemsToOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.items.push(...items);
    await order.save();
    const populated = await order.populate([
      { path: 'tableId', select: 'tableNumber' },
      { path: 'waiterId', select: STAFF_FIELDS }
    ]);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
