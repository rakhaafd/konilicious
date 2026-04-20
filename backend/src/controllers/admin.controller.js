const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/user.model');
const Menu = require('../models/menu.model');
const Rating = require('../models/rating.model');
const Order = require('../models/order.model');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseRole = (role) => {
  if (!role || typeof role !== 'string') return null;
  const normalized = role.trim().toLowerCase();
  if (!['admin', 'user'].includes(normalized)) return null;
  return normalized;
};

const parseCategory = (category) => {
  if (!category || typeof category !== 'string') return null;
  const normalized = category.trim().toLowerCase();
  if (normalized === 'makanan') return 'Makanan';
  if (normalized === 'minuman') return 'Minuman';
  return null;
};

const parseRatingValue = (value) => {
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return null;
  if (numeric < 1 || numeric > 5) return null;
  return numeric;
};

const parseLabelOptions = (value) => {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return [...new Set(parsed.map((item) => String(item).trim()).filter(Boolean))];
        }
      } catch (err) {
        // Fallback to CSV parsing below.
      }
    }

    return [...new Set(trimmed.split(',').map((item) => item.trim()).filter(Boolean))];
  }

  return null;
};

const sanitizeUser = (user) => {
  const raw = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    _id: raw._id,
    username: raw.username,
    email: raw.email,
    role: raw.role,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

const sanitizeMenu = (menu) => {
  const raw = typeof menu.toObject === 'function' ? menu.toObject() : menu;
  return {
    _id: raw._id,
    name: raw.name,
    category: raw.category,
    labelOptions: Array.isArray(raw.labelOptions) ? raw.labelOptions : [],
    tag: raw.tag,
    price: raw.price,
    description: raw.description,
    image: raw.image,
    imagePublicId: raw.imagePublicId,
  };
};

const sanitizeRating = (rating) => {
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

exports.getDashboardSummary = async (req, res) => {
  try {
    const [totalUsers, totalMenus, totalRatings, completedOrders] = await Promise.all([
      User.countDocuments(),
      Menu.countDocuments(),
      Rating.countDocuments(),
      Order.countDocuments({ status: 'COMPLETED' }),
    ]);

    res.json({
      totalUsers,
      totalMenus,
      totalRatings,
      completedOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const role = parseRole(req.body.role || 'user');

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, dan password wajib diisi' });
    }

    if (!role) {
      return res.status(400).json({ message: 'Role tidak valid. Gunakan user/admin' });
    }

    const existing = await User.findOne({
      $or: [{ email: String(email).trim() }, { username: String(username).trim() }],
    });
    if (existing) {
      return res.status(409).json({ message: 'Username atau email sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: String(username).trim(),
      email: String(email).trim(),
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: 'User berhasil dibuat', user: sanitizeUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    const user = await User.findById(id).select('+password');
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    if (req.body.username !== undefined) {
      const username = String(req.body.username).trim();
      if (!username) {
        return res.status(400).json({ message: 'Username tidak boleh kosong' });
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername && String(existingUsername._id) !== String(id)) {
        return res.status(409).json({ message: 'Username sudah digunakan' });
      }

      user.username = username;
    }

    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim();
      if (!email) {
        return res.status(400).json({ message: 'Email tidak boleh kosong' });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail && String(existingEmail._id) !== String(id)) {
        return res.status(409).json({ message: 'Email sudah digunakan' });
      }

      user.email = email;
    }

    if (req.body.role !== undefined) {
      const role = parseRole(req.body.role);
      if (!role) {
        return res.status(400).json({ message: 'Role tidak valid. Gunakan user/admin' });
      }
      user.role = role;
    }

    if (req.body.password !== undefined) {
      const password = String(req.body.password);
      if (!password.trim()) {
        return res.status(400).json({ message: 'Password tidak boleh kosong' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = await User.findById(id).select('-password');
    res.json({ message: 'User berhasil diupdate', user: sanitizeUser(updatedUser) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User tidak ditemukan' });

    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ _id: -1 });
    res.json(menus.map(sanitizeMenu));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID menu tidak valid' });
    }

    const menu = await Menu.findById(id);
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });

    res.json(sanitizeMenu(menu));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const category = parseCategory(req.body.category || req.body.kategori);
    const labelOptions = parseLabelOptions(req.body.labelOptions);

    if (!name || price === undefined || !description) {
      return res.status(400).json({ message: 'name, price, description wajib diisi' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Kategori tidak valid. Gunakan Makanan/Minuman' });
    }

    if (labelOptions === null) {
      return res.status(400).json({ message: 'Format labelOptions tidak valid' });
    }

    const menu = await Menu.create({
      name: String(name).trim(),
      category,
      labelOptions: labelOptions === undefined ? [] : labelOptions,
      tag: req.body.tag ? String(req.body.tag).trim() : null,
      price: Number(price),
      description: String(description).trim(),
      image: req.body.image || null,
      imagePublicId: req.body.imagePublicId || null,
    });

    res.status(201).json({ message: 'Menu berhasil dibuat', menu: sanitizeMenu(menu) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID menu tidak valid' });
    }

    const menu = await Menu.findById(id);
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });

    if (req.body.name !== undefined) menu.name = String(req.body.name).trim();
    if (req.body.price !== undefined) menu.price = Number(req.body.price);
    if (req.body.description !== undefined) menu.description = String(req.body.description).trim();
    if (req.body.tag !== undefined) menu.tag = req.body.tag ? String(req.body.tag).trim() : null;
    if (req.body.image !== undefined) menu.image = req.body.image || null;
    if (req.body.imagePublicId !== undefined) menu.imagePublicId = req.body.imagePublicId || null;

    if (req.body.category !== undefined || req.body.kategori !== undefined) {
      const category = parseCategory(req.body.category || req.body.kategori);
      if (!category) {
        return res.status(400).json({ message: 'Kategori tidak valid. Gunakan Makanan/Minuman' });
      }
      menu.category = category;
    }

    if (req.body.labelOptions !== undefined) {
      const labelOptions = parseLabelOptions(req.body.labelOptions);
      if (labelOptions === null) {
        return res.status(400).json({ message: 'Format labelOptions tidak valid' });
      }
      menu.labelOptions = labelOptions;
    }

    await menu.save();

    res.json({ message: 'Menu berhasil diupdate', menu: sanitizeMenu(menu) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID menu tidak valid' });
    }

    const deleted = await Menu.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Menu tidak ditemukan' });

    res.json({ message: 'Menu berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('user', 'username email')
      .populate('menu', 'name')
      .populate('order', 'status paymentStatus')
      .sort({ createdAt: -1 });

    res.json(ratings.map(sanitizeRating));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID rating tidak valid' });
    }

    const rating = await Rating.findById(id)
      .populate('user', 'username email')
      .populate('menu', 'name')
      .populate('order', 'status paymentStatus');

    if (!rating) return res.status(404).json({ message: 'Rating tidak ditemukan' });

    res.json(sanitizeRating(rating));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRating = async (req, res) => {
  try {
    const { userId, menuId, orderId, comment } = req.body;
    const ratingValue = parseRatingValue(req.body.rating);

    if (!userId || !menuId || !orderId || !comment) {
      return res.status(400).json({ message: 'userId, menuId, orderId, rating, comment wajib diisi' });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(menuId) || !isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'userId/menuId/orderId tidak valid' });
    }

    if (ratingValue === null) {
      return res.status(400).json({ message: 'Rating wajib angka 1 sampai 5' });
    }

    const [user, menu, order] = await Promise.all([
      User.findById(userId).select('_id'),
      Menu.findById(menuId).select('_id'),
      Order.findById(orderId).select('_id'),
    ]);

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    const rating = await Rating.create({
      user: userId,
      menu: menuId,
      order: orderId,
      rating: ratingValue,
      comment: String(comment).trim(),
    });

    const populated = await Rating.findById(rating._id)
      .populate('user', 'username email')
      .populate('menu', 'name')
      .populate('order', 'status paymentStatus');

    res.status(201).json({ message: 'Rating berhasil dibuat', rating: sanitizeRating(populated) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User sudah memberi rating untuk menu tersebut' });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID rating tidak valid' });
    }

    const ratingDoc = await Rating.findById(id);
    if (!ratingDoc) return res.status(404).json({ message: 'Rating tidak ditemukan' });

    if (req.body.userId !== undefined) {
      if (!isValidObjectId(req.body.userId)) {
        return res.status(400).json({ message: 'userId tidak valid' });
      }
      const user = await User.findById(req.body.userId).select('_id');
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
      ratingDoc.user = req.body.userId;
    }

    if (req.body.menuId !== undefined) {
      if (!isValidObjectId(req.body.menuId)) {
        return res.status(400).json({ message: 'menuId tidak valid' });
      }
      const menu = await Menu.findById(req.body.menuId).select('_id');
      if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
      ratingDoc.menu = req.body.menuId;
    }

    if (req.body.orderId !== undefined) {
      if (!isValidObjectId(req.body.orderId)) {
        return res.status(400).json({ message: 'orderId tidak valid' });
      }
      const order = await Order.findById(req.body.orderId).select('_id');
      if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
      ratingDoc.order = req.body.orderId;
    }

    if (req.body.rating !== undefined) {
      const ratingValue = parseRatingValue(req.body.rating);
      if (ratingValue === null) {
        return res.status(400).json({ message: 'Rating wajib angka 1 sampai 5' });
      }
      ratingDoc.rating = ratingValue;
    }

    if (req.body.comment !== undefined) {
      const comment = String(req.body.comment).trim();
      if (!comment) {
        return res.status(400).json({ message: 'Comment tidak boleh kosong' });
      }
      ratingDoc.comment = comment;
    }

    await ratingDoc.save();

    const populated = await Rating.findById(ratingDoc._id)
      .populate('user', 'username email')
      .populate('menu', 'name')
      .populate('order', 'status paymentStatus');

    res.json({ message: 'Rating berhasil diupdate', rating: sanitizeRating(populated) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User sudah memberi rating untuk menu tersebut' });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID rating tidak valid' });
    }

    const deleted = await Rating.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Rating tidak ditemukan' });

    res.json({ message: 'Rating berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
