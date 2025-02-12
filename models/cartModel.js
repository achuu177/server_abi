const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 0,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to calculate total price
cartSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.products.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );
};

// Create and export the Cart model
const Cart = model("Cart", cartSchema);

module.exports = {Cart};