const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //sessionId: {
    //  type: String,
     // required: true,
   // },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "success", "shipping", "delivery", "delivered"],
      default: "processing",
    },
    returnStatus: {
      type: String,
      enum: ["eligible", "not eligible", "returned"],
      default: "eligible",
    },
    returnApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    returnValidUntil: {
      type: Date,
      default: function () {
        const now = new Date();
        now.setDate(now.getDate() + 7);
        return now;
      },
    },
    returnReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.methods.returnEligible = function () {
  return Date.now() <= this.returnValidUntil.getTime();
};

// Create and export the Order model
const Order = model("Order", orderSchema);

module.exports = {Order};