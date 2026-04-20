const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { isAuth } = require('../middleware/auth.middleware');

// Static routes dulu
router.post('/webhook', paymentController.webhookPayment);
router.get('/history', isAuth, paymentController.getMyPayments);
router.delete('/history', isAuth, paymentController.deleteAllPayments);
router.delete('/history/:id', isAuth, paymentController.deletePayment);
router.get('/check/:id', isAuth, paymentController.checkPaymentStatus);
router.post('/checkout', isAuth, paymentController.createCheckoutPayment);

router.post('/', isAuth, paymentController.createPayment);
router.post('/:id', isAuth, paymentController.createPaymentById);

module.exports = router;