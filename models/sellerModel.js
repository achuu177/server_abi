const { Schema, model } = require("mongoose");

const sellerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      miniLength: 6,
    },
    role: {
      type: String,
      enum: ["seller", "admin"],
      default: "seller",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default:
        "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg",
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    banners: [{ type: Schema.Types.ObjectId, ref: "Banner" }],
  },
  { timestamps: true }
);

const Seller = model("Seller", sellerSchema);

module.exports = {Seller};