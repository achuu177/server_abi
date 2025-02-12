const {Wishlist} = require("../models/wishlistModel.js");
const Product = require("../models/productModel.js");
const catchErrorHandler = require("../utils/catchErrorHandler.js");

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Get productId
    const { productId } = req.body;

    // Handle product id not found
    if (!productId) {
      return res.status(400).json({ message: "Please provide product id" });
    }

    // Find the product
    const product = await Product.findById(productId);

    // Handle product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user wishlist
    let wishlist = await Wishlist.findOne({ userId });

    // Handle wishlist not found by create new one
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check the product already in the wishlist
    const productExists = wishlist.products.find((product) =>
      product.productId.equals(productId)
    );

    // Handle product found in the wishlist
    if (productExists) {
      return res
        .status(400)
        .json({ message: "Product already exist in the wishlist" });
    }

    // Add product
    wishlist.products.push({ productId });

    // Save the wishlist
    await wishlist.save();

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Product added to wishlist", data: wishlist });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Display wishlist products
const getWishlist = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Get wishlist
    const wishlist = await Wishlist.findOne({ userId }).populate(
      "products.productId"
    );

    // Check wishlist exists
    if (!wishlist) {
      return res.status(404).json({ message: "wishlist not found" });
    }

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Wishlist fetched successfully", data: wishlist });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Remove product
const removeProductFromWishlist = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Get product id
    const { productId } = req.body;

    // Find the user wishlist
    let wishlist = await Wishlist.findOne({ userId });

    // Handle wishlist not found
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Remove product
    wishlist.products = wishlist.products.filter(
      (product) => !product.productId.equals(productId)
    );

    // Save the wishlist
    await wishlist.save();

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Product removed", data: wishlist, new: true });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Export all functions
module.exports = {
  addToWishlist,
  getWishlist,
  removeProductFromWishlist,
};