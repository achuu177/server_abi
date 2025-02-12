const express = require("express");
const {
  addToCart,
  removeProductFromCart,
  getCart,
  clearCart,
  addToFromWishlistCart,
  addCartQuantity,
} = require("../controllers/cartControllers.js");
const {userAuth} = require("../middlewares/userAuth.js");

// Configure router
const cartRouter = express.Router();

// Add product to cart
cartRouter.post("/add-product", userAuth, addToCart);

// Add product quantity in cart
cartRouter.post("/add-cartQuantity", userAuth, addCartQuantity);

// Add product to cart from wishlist
cartRouter.post("/add-product-wishlist-to-cart", userAuth, addToFromWishlistCart);

// Display cart products
cartRouter.get("/cart", userAuth, getCart);

// Remove product from cart
cartRouter.delete("/remove-product", userAuth, removeProductFromCart);

// Clear cart
cartRouter.delete("/clear-cart", userAuth, clearCart);

// Export the router
module.exports = {cartRouter};