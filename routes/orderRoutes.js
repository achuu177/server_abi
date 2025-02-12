const express = require("express");
const { adminAuth } = require("../middlewares/adminAuth.js");
const { sellerAuth } = require("../middlewares/sellerAuth.js");
const { userAuth } = require("../middlewares/userAuth.js");

const {
  createOrder,
  getOrderDetails,
  getOrders,
  getOrdersByStatus,
  getSellerOrders,
  getSellerOrdersByStatus,
  getUserOrder,
  handleOrderStatus,
  updateStock,
  getOrderTotalPriceByCategory,
  getSellerOrderTotalPriceByCategory,
  searchOrders,
  searchSellerOrders,
} = require("../controllers/orderControllers.js");

// Configure router
const orderRouter = express.Router();

orderRouter.post("/create-orders", userAuth, createOrder);
// Get all orders
orderRouter.get("/get-orders", adminAuth, getOrders);

// Get seller all orders
orderRouter.get("/get-seller-orders", sellerAuth, getSellerOrders);

// Get orders by status
orderRouter.post("/get-orders-by-status", sellerAuth, getOrdersByStatus);

// Get seller orders by status
orderRouter.post(
  "/get-seller-orders-by-status",
  sellerAuth,
  getSellerOrdersByStatus
);

// Get order details
orderRouter.get("/get-order-details/:orderId", sellerAuth, getOrderDetails);

// Change order status
orderRouter.post("/change-order-status", sellerAuth, handleOrderStatus);

// Get your order
orderRouter.get("/get-user-orders", userAuth, getUserOrder);

// Update stock
orderRouter.get("/update-stock", userAuth, updateStock);

// Get total price by product category from all orders
orderRouter.get(
  "/orders-total-price-by-category",
  adminAuth,
  getOrderTotalPriceByCategory
);

// Get total price by product category by seller orders
orderRouter.get(
  "/seller-orders-total-price-by-category",
  sellerAuth,
  getSellerOrderTotalPriceByCategory
);

// Search orders
orderRouter.post("/search-orders", adminAuth, searchOrders);

// Search seller orders
orderRouter.post("/search-seller-orders", sellerAuth, searchSellerOrders);

module.exports = {orderRouter};
