const mongoose = require('mongoose');
const Rating = require('../models/rating.model');
const Order = require('../models/order.model');
const Menu = require('../models/menu.model');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeRating = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (!Number.isInteger(numeric)) return null;
  if (numeric < 1 || numeric > 5) return null;
  return numeric;
};

const normalizeComment = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const formatRatingResponse = (rating) => {
  const raw = typeof rating.toObject === 'function' ? rating.toObject() : rating;

  return {
    _id: raw._id,
    user: raw.user,
    menu: raw.menu,
    order: raw.order,
    rating: raw.rating,
    comment: raw.comment,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

const findEligibleOrder = async (userId, menuId) => {
  return Order.findOne({
    user: userId,
    status: { $in: ['WAITING', 'PROCESSING', 'COMPLETED'] },
    paymentStatus: 'PAID',
    'items.menu': menuId,
  })
    .sort({ createdAt: -1 })
    .select('_id');
};

exports.getRatingsByMenu = async (req, res) => {
  try {
    const { menuId } = req.params;

    if (!isValidObjectId(menuId)) {
      return res.status(400).json({ message: 'menuId tidak valid' });
    }

    const ratings = await Rating.find({ menu: menuId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const total = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = ratings.length ? Number((total / ratings.length).toFixed(2)) : 0;

    res.json({
      menuId,
      averageRating,
      totalRatings: ratings.length,
      ratings: ratings.map(formatRatingResponse),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRating = async (req, res) => {
  try {
    const { menuId } = req.params;
    const ratingValue = normalizeRating(req.body.rating);
    const comment = normalizeComment(req.body.comment);

    if (!isValidObjectId(menuId)) {
      return res.status(400).json({ message: 'menuId tidak valid' });
    }

    if (ratingValue === null) {
      return res.status(400).json({ message: 'Rating wajib berupa angka 1 sampai 5' });
    }

    if (!comment) {
      return res.status(400).json({ message: 'Komentar wajib diisi' });
    }

    const menu = await Menu.findById(menuId).select('_id');
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan' });
    }

    const eligibleOrder = await findEligibleOrder(req.user.id, menuId);
    if (!eligibleOrder) {
      return res.status(403).json({
        message: 'Rating hanya bisa dibuat setelah transaksi menu ini selesai dan sudah dibayar',
      });
    }

    const existingRating = await Rating.findOne({ user: req.user.id, menu: menuId });
    if (existingRating) {
      return res.status(409).json({
        message: 'Kamu sudah pernah memberi rating untuk menu ini. Gunakan endpoint edit rating.',
      });
    }

    const rating = await Rating.create({
      user: req.user.id,
      menu: menuId,
      order: eligibleOrder._id,
      rating: ratingValue,
      comment,
    });

    const populated = await Rating.findById(rating._id).populate('user', 'username');

    res.status(201).json({
      message: 'Rating berhasil ditambahkan',
      rating: formatRatingResponse(populated),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateMyRating = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID rating tidak valid' });
    }

    const ratingDoc = await Rating.findOne({ _id: id, user: req.user.id });
    if (!ratingDoc) {
      return res.status(404).json({ message: 'Rating tidak ditemukan' });
    }

    if (req.body.rating !== undefined) {
      const ratingValue = normalizeRating(req.body.rating);
      if (ratingValue === null) {
        return res.status(400).json({ message: 'Rating wajib berupa angka 1 sampai 5' });
      }
      ratingDoc.rating = ratingValue;
    }

    if (req.body.comment !== undefined) {
      const comment = normalizeComment(req.body.comment);
      if (!comment) {
        return res.status(400).json({ message: 'Komentar tidak boleh kosong' });
      }
      ratingDoc.comment = comment;
    }

    await ratingDoc.save();

    const populated = await Rating.findById(ratingDoc._id).populate('user', 'username');

    res.json({
      message: 'Rating berhasil diupdate',
      rating: formatRatingResponse(populated),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMyRating = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID rating tidak valid' });
    }

    const deleted = await Rating.findOneAndDelete({ _id: id, user: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Rating tidak ditemukan' });
    }

    res.json({ message: 'Rating berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
