const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { isAuth } = require('../middleware/auth.middleware');

router.get('/', isAuth, cartController.getMyCart);
router.post('/', isAuth, cartController.addToCart);
router.put('/:id', isAuth, cartController.updateCartItem);
router.delete('/clear', isAuth, cartController.clearCart);
router.delete('/:id', isAuth, cartController.deleteCartItem);


module.exports = router;