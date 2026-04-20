const Menu = require('../models/menu.model');
const Rating = require('../models/rating.model');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary (ideally move this to a config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: upload buffer stream to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'menu_images' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const normalizeKategori = (value) => {
  if (!value || typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'makanan') return 'Makanan';
  if (normalized === 'minuman') return 'Minuman';

  return null;
};

const normalizeTag = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value.trim();
};

const normalizeLabelText = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value
    .trim()
    .replace(/^['\"]+|['\"]+$/g, '')
    .toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeLabelOptions = (value) => {
  if (Array.isArray(value)) {
    const normalized = value
      .map(normalizeLabelText)
      .filter(Boolean);

    return [...new Set(normalized)];
  }

  if (typeof value === 'string') {
    const rawValue = value.trim();

    // Accept JSON array string from form-data: ["a","b"]
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
          const normalizedParsed = parsed
            .map(normalizeLabelText)
            .filter(Boolean);

          return [...new Set(normalizedParsed)];
        }
      } catch (err) {
        // Fallback to comma-separated parsing below
      }
    }

    const normalized = value
      .split(',')
      .map(normalizeLabelText)
      .filter(Boolean);

    return [...new Set(normalized)];
  }

  return null;
};

const validateKategori = (kategori) => {
  if (!kategori) {
    return 'Kategori wajib diisi dengan nilai Makanan atau Minuman';
  }

  if (!['Makanan', 'Minuman'].includes(kategori)) {
    return 'Kategori tidak valid. Gunakan Makanan atau Minuman';
  }

  return null;
};

const validateLabelOptions = (labelOptions) => {
  if (!Array.isArray(labelOptions) || labelOptions.length === 0) {
    return 'Label options wajib diisi minimal 1 pilihan';
  }

  return null;
};

const formatMenuResponse = (menu) => {
  if (!menu) return null;

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

const buildMenuWithRatings = (menu, ratings = []) => {
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? Number((ratings.reduce((sum, item) => sum + item.rating, 0) / totalRatings).toFixed(2))
    : 0;

  const comments = ratings.map((item) => ({
    ratingId: item._id,
    user: {
      _id: item.user?._id || null,
      username: item.user?.username || null,
    },
    rating: item.rating,
    comment: item.comment,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return {
    ...formatMenuResponse(menu),
    averageRating,
    totalRatings,
    comments,
  };
};

exports.getAllMenu = async (req, res) => {
  try {
    const menus = await Menu.find();

    if (!menus.length) {
      return res.json([]);
    }

    const menuIds = menus.map((menu) => menu._id);
    const ratings = await Rating.find({ menu: { $in: menuIds } })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const ratingsByMenuId = ratings.reduce((acc, item) => {
      const key = String(item.menu);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    res.json(
      menus.map((menu) => buildMenuWithRatings(menu, ratingsByMenuId[String(menu._id)] || []))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });

    const ratings = await Rating.find({ menu: menu._id })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(buildMenuWithRatings(menu, ratings));
  } catch (err) {
    res.status(400).json({ message: 'ID tidak valid' });
  }
};

exports.addMenu = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const kategori = normalizeKategori(req.body.kategori || req.body.category);
    const labelOptions = normalizeLabelOptions(
      req.body.labelOptions ?? req.body.labels ?? req.body.label
    );
    const tag = normalizeTag(req.body.tag);

    const validationError = validateKategori(kategori);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const labelOptionsError = validateLabelOptions(labelOptions);
    if (labelOptionsError) {
      return res.status(400).json({ message: labelOptionsError });
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const menu = await Menu.create({
      name,
      category: kategori,
      label: null,
      labelOptions,
      tag,
      price,
      description,
      image: imageUrl,
      imagePublicId,
    });

    res.status(201).json({ message: 'Menu berhasil ditambahkan', menu: formatMenuResponse(menu) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const kategoriInput = req.body.kategori || req.body.category;
    const labelOptionsInput = req.body.labelOptions ?? req.body.labels ?? req.body.label;
    const tagInput = req.body.tag;

    const existingMenu = await Menu.findById(req.params.id);
    if (!existingMenu) return res.status(404).json({ message: 'Menu tidak ditemukan' });

    const kategori = normalizeKategori(kategoriInput || existingMenu.category || existingMenu.kategori);
    const labelOptions = labelOptionsInput === undefined
      ? (Array.isArray(existingMenu.labelOptions) ? existingMenu.labelOptions : [])
      : normalizeLabelOptions(labelOptionsInput);
    const tag = normalizeTag(tagInput || existingMenu.tag);

    const validationError = validateKategori(kategori);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const labelOptionsError = validateLabelOptions(labelOptions);
    if (labelOptionsError) {
      return res.status(400).json({ message: labelOptionsError });
    }

    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category: kategori,
        label: null,
        labelOptions,
        tag,
        price,
        description,
      },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Menu berhasil diupdate', menu: formatMenuResponse(menu) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMenuById = async (req, res) => {
  try {
    // Defensive fallback if /all is matched by dynamic :id route
    if (req.params.id === 'all') {
      return exports.deleteAllMenu(req, res);
    }

    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    res.json({ message: 'Menu berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAllMenu = async (req, res) => {
  try {
    const result = await Menu.deleteMany({});
    res.json({
      message: 'Semua menu berhasil dihapus',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};