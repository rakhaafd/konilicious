const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Makanan", "Minuman"],
    default: "Makanan",
    required: true,
  },
  labelOptions: {
    type: [
      {
        type: String,
        trim: true,
      },
    ],
    default: [],
  },
  tag: {
    type: String,
    default: null,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: { type: String, default: null },
  imagePublicId: { type: String, default: null },
});

module.exports = mongoose.model("Menu", menuSchema);
