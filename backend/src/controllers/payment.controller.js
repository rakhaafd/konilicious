const { Xendit } = require('xendit-node');
const Payment = require('../models/payment.model');
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Menu = require('../models/menu.model');

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY
});

const getRedirectUrls = () => ({
  successRedirectUrl:
    process.env.XENDIT_SUCCESS_REDIRECT || 'http://localhost:5173/profile',
  failureRedirectUrl:
    process.env.XENDIT_FAILURE_REDIRECT || 'http://localhost:5173/menu',
});

const isPaidStatus = (status) => status === 'PAID' || status === 'SETTLED';

const ensureOrderForPaidPayment = async (paymentDoc) => {
  const payment = await Payment.findById(paymentDoc._id)
    .populate({ path: 'cart', populate: { path: 'menu' } });

  if (!payment) return;

  const existingOrder = await Order.findOne({
    user: payment.user,
    xenditInvoiceId: payment.xenditInvoiceId,
  }).select('_id');

  if (!existingOrder) {
    const snapshotItems = (payment.items || []).filter((item) => item.menu);
    const cartFallbackItems = payment.cart
      .filter((cartItem) => cartItem.menu)
      .map((cartItem) => ({
        menu: cartItem.menu._id,
        quantity: cartItem.quantity,
        price: cartItem.menu.price,
      }));

    const orderItems = snapshotItems.length > 0
      ? snapshotItems.map((item) => ({
          menu: item.menu,
          quantity: item.quantity,
          price: item.price,
        }))
      : cartFallbackItems;

    if (orderItems.length > 0) {

      await Order.create({
        user: payment.user,
        items: orderItems,
        totalPrice: payment.totalAmount,
        status: 'WAITING',
        paymentStatus: 'PAID',
        xenditInvoiceId: payment.xenditInvoiceId,
      });
    }
  }

  await Cart.deleteMany({ _id: { $in: payment.cart.map((c) => c._id) } });
};

// POST buat invoice pembayaran (semua cart)
exports.createPayment = async (req, res) => {
  try {
    const { successRedirectUrl, failureRedirectUrl } = getRedirectUrls();

    const cart = await Cart.find({ user: req.user.id }).populate('menu');
    if (cart.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const validCartItems = cart.filter((item) => item.menu);
    const invalidCartItems = cart.filter((item) => !item.menu);

    if (invalidCartItems.length > 0) {
      await Cart.deleteMany({ _id: { $in: invalidCartItems.map((item) => item._id) } });
    }

    if (validCartItems.length === 0) {
      return res.status(400).json({
        message: 'Semua item di cart tidak valid karena menu sudah tidak tersedia. Silakan tambah menu lagi.',
      });
    }

    const totalAmount = validCartItems.reduce((total, item) => {
      return total + (item.menu.price * item.quantity);
    }, 0);

    const paymentItemsSnapshot = validCartItems.map((item) => ({
      menu: item.menu._id,
      name: item.menu.name,
      quantity: item.quantity,
      price: item.menu.price,
    }));

    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId: `payment-${req.user.id}-${Date.now()}`,
        amount: totalAmount,
        payerEmail: req.user.email,
        description: `Payment order by ${req.user.username}`,
        invoiceDuration: 86400,
        currency: 'IDR',
        successRedirectUrl,
        failureRedirectUrl,
        items: validCartItems.map(item => ({
          name: item.menu.name,
          quantity: item.quantity,
          price: item.menu.price
        }))
      }
    });

    const payment = await Payment.create({
      user: req.user.id,
      cart: validCartItems.map(item => item._id),
      items: paymentItemsSnapshot,
      xenditInvoiceId: invoice.id,
      invoiceUrl: invoice.invoiceUrl,
      totalAmount,
      status: 'PENDING'
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoiceUrl: invoice.invoiceUrl,
      totalAmount,
      payment
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST buat invoice untuk satu item cart
exports.createPaymentById = async (req, res) => {
  try {
    const { successRedirectUrl, failureRedirectUrl } = getRedirectUrls();
    const { quantity = 1 } = req.body;

    const cart = await Cart.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('menu');

    if (!cart) return res.status(404).json({ message: 'Item not found in cart' });

    if (!cart.menu) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(400).json({
        message: 'Item cart tidak valid karena menu sudah tidak tersedia',
      });
    }

    const totalAmount = cart.menu.price * quantity;

    const paymentItemsSnapshot = [{
      menu: cart.menu._id,
      name: cart.menu.name,
      quantity,
      price: cart.menu.price,
    }];

    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId: `payment-${req.user.id}-${Date.now()}`,
        amount: totalAmount,
        payerEmail: req.user.email,
        description: `Payment order by ${req.user.username}`,
        invoiceDuration: 86400,
        currency: 'IDR',
        successRedirectUrl,
        failureRedirectUrl,
        items: [{
          name: cart.menu.name,
          quantity: quantity,
          price: cart.menu.price
        }]
      }
    });

    const payment = await Payment.create({
      user: req.user.id,
      cart: [cart._id],
      items: paymentItemsSnapshot,
      xenditInvoiceId: invoice.id,
      invoiceUrl: invoice.invoiceUrl,
      totalAmount,
      status: 'PENDING'
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoiceUrl: invoice.invoiceUrl,
      totalAmount,
      payment
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST webhook dari Xendit
exports.webhookPayment = async (req, res) => {
  try {
    const webhookToken = req.headers['x-callback-token'];
    if (webhookToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id, external_id, status } = req.body;

    const payment = await Payment.findOne({
      $or: [
        { xenditInvoiceId: id },
        { xenditInvoiceId: external_id },
      ],
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = isPaidStatus(status) ? 'PAID' : status;
    await payment.save();

    if (isPaidStatus(status)) {
      await ensureOrderForPaidPayment(payment);
    }

    res.json({ message: 'Webhook received' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET riwayat pembayaran user
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('cart')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET cek status pembayaran
exports.checkPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const invoice = await xenditClient.Invoice.getInvoiceById({
      invoiceId: payment.xenditInvoiceId
    });

    payment.status = isPaidStatus(invoice.status) ? 'PAID' : invoice.status;
    await payment.save();

    if (isPaidStatus(invoice.status)) {
      await ensureOrderForPaidPayment(payment);
    }

    res.json({ status: invoice.status, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE hapus satu history transaksi
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!payment) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE hapus semua history transaksi
exports.deleteAllPayments = async (req, res) => {
  try {
    await Payment.deleteMany({ user: req.user.id });
    res.json({ message: 'All transactions deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST checkout langsung dari menu detail (tanpa item cart)
exports.createCheckoutPayment = async (req, res) => {
  try {
    const { successRedirectUrl, failureRedirectUrl } = getRedirectUrls();
    const { menuId, quantity = 1 } = req.body;

    if (!menuId) {
      return res.status(400).json({ message: 'menuId wajib diisi' });
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan' });
    }

    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const totalAmount = menu.price * safeQuantity;

    const paymentItemsSnapshot = [{
      menu: menu._id,
      name: menu.name,
      quantity: safeQuantity,
      price: menu.price,
    }];

    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId: `payment-${req.user.id}-${Date.now()}`,
        amount: totalAmount,
        payerEmail: req.user.email,
        description: `Payment order by ${req.user.username}`,
        invoiceDuration: 86400,
        currency: 'IDR',
        successRedirectUrl,
        failureRedirectUrl,
        items: [{
          name: menu.name,
          quantity: safeQuantity,
          price: menu.price,
        }],
      },
    });

    const payment = await Payment.create({
      user: req.user.id,
      cart: [],
      items: paymentItemsSnapshot,
      xenditInvoiceId: invoice.id,
      invoiceUrl: invoice.invoiceUrl,
      totalAmount,
      status: 'PENDING',
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoiceUrl: invoice.invoiceUrl,
      totalAmount,
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};