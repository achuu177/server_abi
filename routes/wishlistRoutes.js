const express = require("express");
const {
  addToWishlist,
  removeProductFromWishlist,
  getWishlist,
} = require("../controllers/wishlistControllers.js");
const {userAuth} = require("../middlewares/userAuth.js");

// Configure router
const wishlistRouter = express.Router();

// Add product to wishlist
wishlistRouter.post("/add-product", userAuth, addToWishlist);

// Display wishlist products
wishlistRouter.get("/wishlist", userAuth, getWishlist);

// Remove product from wishlist
wishlistRouter.delete("/remove-product", userAuth, removeProductFromWishlist);

// Export the router
module.exports ={wishlistRouter};