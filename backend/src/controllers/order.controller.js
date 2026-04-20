const Order = require('../models/order.model');
const mongoose = require('mongoose');
const VALID_ORDER_STATUS = ['WAITING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

const normalizeStatus = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value.trim().toUpperCase();
};

// Admin: get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email username')
      .populate('items.menu', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: get orders by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const status = normalizeStatus(req.params.status);
    if (!status || !VALID_ORDER_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const orders = await Order.find({ status })
      .populate('user', 'name email username')
      .populate('items.menu', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      user: req.user.id,
      status: { $in: ['WAITING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] }
    })
      .populate('items.menu', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const status = normalizeStatus(
      req.body.status || req.body.orderStatus || req.body.newStatus
    );

    if (!status || !VALID_ORDER_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    updateData[`statusTimestamps.${status}`] = new Date();

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email username');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: delete all orders
exports.deleteAllOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    res.json({
      message: 'All orders deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: delete order by id
exports.deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order deleted successfully',
      order: deletedOrder,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};