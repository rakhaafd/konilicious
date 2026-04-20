const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { isAuth } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/isAdmin.middleware');

// User
router.get('/my-orders', isAuth, orderController.getMyOrders);

// Admin
router.get('/', isAuth, isAdmin, orderController.getAllOrders);
router.get('/status/:status', isAuth, isAdmin, orderController.getOrdersByStatus);
router.patch('/:id/status', isAuth, isAdmin, orderController.updateOrderStatus);
router.put('/:id/status', isAuth, isAdmin, orderController.updateOrderStatus);
router.delete('/', isAuth, isAdmin, orderController.deleteAllOrders);
router.delete('/:id', isAuth, isAdmin, orderController.deleteOrderById);

module.exports = router;