const User = require("../models/user.model");
const Cart = require('../models/cart.model');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'profile_pictures' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      $or: [{ _id: id }, { username: id }]
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "cannot find user" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "ID tidak valid" });
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ message: "Username tidak boleh kosong" });
    }

    const trimmedUsername = username.trim();

    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    user.username = trimmedUsername;
    await user.save();

    res.json({ username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const cart = await Cart.find({ user: req.user.id }).populate('menu');

    res.json({ user, cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMyProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File profile picture wajib diupload' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId).catch(() => null);
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    user.profilePicture = uploadResult.secure_url;
    user.profilePicturePublicId = uploadResult.public_id;
    await user.save();

    res.json({
      message: 'Profile picture berhasil diupdate',
      profilePicture: user.profilePicture,
      profilePicturePublicId: user.profilePicturePublicId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};