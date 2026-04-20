const Cart = require('../models/cart.model');

// GET semua cart milik user yang login
exports.getMyCart = async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user.id })
      .populate('menu')
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST tambah item ke cart
exports.addToCart = async (req, res) => {
  try {
    const { menuId, quantity } = req.body;

    // cek apakah menu sudah ada di cart
    const existingItem = await Cart.findOne({ user: req.user.id, menu: menuId });
    if (existingItem) {
      existingItem.quantity += quantity || 1;
      await existingItem.save();
      return res.json({ message: 'Quantity diupdate', cart: existingItem });
    }

    const cart = await Cart.create({
      user: req.user.id,
      menu: menuId,
      quantity: quantity || 1
    });

    res.status(201).json({ message: 'Item ditambahkan ke cart', cart });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update quantity item di cart
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { quantity },
      { new: true, runValidators: true }
    );

    if (!cart) return res.status(404).json({ message: 'Item tidak ditemukan' });
    res.json({ message: 'Cart diupdate', cart });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE hapus item dari cart
exports.deleteCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Item tidak ditemukan' });
    res.json({ message: 'Item dihapus dari cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user.id });
    res.json({ message: 'Cart dikosongkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};