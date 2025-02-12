const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 100,
    },

    color: {
      type: String,
      enum: ["black", "yellow"],
      required: true,
      maxLength: 10,
    },

    image: {
      type: String,
      default: "",
    },

    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
    },
  },
  { timestamps: true }
);

const Banner = model("Banner", bannerSchema);

module.exports = {Banner};