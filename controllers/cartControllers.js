const {Cart} = require("../models/cartModel.js");
const {Wishlist} = require("../models/wishlistModel.js");
const Product = require("../models/productModel.js");
const {catchErrorHandler} = require("../utils/catchErrorHandler.js");

// Add product to cart
const addToCart = async (req, res) => {
  try {
    // Get user id from request body
    const userId = req.user.id;

    // Get productId from request body
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

    // Find the user cart
    let cart = await Cart.findOne({ userId });

    // Create new cart doesn't exist
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check if the product already exists in the cart
    const productExists = cart.products.find((item) =>
      item.productId.equals(productId)
    );

    // Handle product already in the cart
    if (productExists) {
      return res
        .status(400)
        .json({ message: "This product is already in your cart" });
    }

    // Handle product is out of stock
    if (product.stock < 1) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    // Add new product to cart
    cart.products.push({ productId, price: product.price, quantity: 1 });

    // Decrease stock by 1 after adding to cart
    product.stock -= 1;

    // Save product
    await product.save();

    // Recalculate total price
    cart.calculateTotalPrice();

    // Save the cart
    await cart.save();

    // Send response to frontend
    res.status(200).json({ message: "Product added to cart", data: cart });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Add product to cart from wishlist
const addToFromWishlistCart = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Get productId
    const { productId } = req.body;

    // Check productId field
    if (!productId) {
      return res.status(400).json({ message: "Please provide product id" });
    }

    // Find the product
    const product = await Product.findById(productId);

    // Handle product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user cart
    let cart = await Cart.findOne({ userId });

    // Create new cart if cart doesn't exist
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check the product already in the cart
    const productExists = cart.products.find((product) =>
      product.productId.equals(productId)
    );

    // Handle product found in the cart
    if (productExists) {
      // Handle stock not enough
      if (productExists.quantity + 1 > product.stock) {
        return res
          .status(400)
          .json({ message: "Cannot add more than available stock" });
      }

      // Increase product quantity
      productExists.quantity += 1;

      // Decrease stock by 1 after adding to cart
      product.stock -= 1;
      await product.save();

      // Recalculate total
      cart.calculateTotalPrice();
    } else {
      // Handle case when stock is zero
      if (product.stock < 1) {
        return res.status(400).json({ message: "Product is out of stock" });
      }

      // Add product to cart
      cart.products.push({ productId, price: product.price, quantity: 1 });

      // Decrease stock by 1 after adding to cart
      product.stock -= 1;
      await product.save();
    }

    // Recalculate total
    cart.calculateTotalPrice();

    // Save the cart
    await cart.save();

    // Remove product from wishlist
    await Wishlist.updateOne(
      { userId },
      { $pull: { products: { productId } } }
    );

    // Send response to frontend
    res.status(200).json({ message: "Product added to cart", data: cart });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Render cart products
const getCart = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Get cart
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    // Check cart exists
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Send response to frontend
    res.status(200).json({ message: "Cart fetched successfully", data: cart });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Add quantity
const addCartQuantity = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Get productId
    const { productId } = req.body;

    // Check productId field
    if (!productId) {
      return res.status(400).json({ message: "Please provide product id" });
    }

    // Find the product
    const product = await Product.findById(productId);

    // Handle product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user cart
    let cart = await Cart.findOne({ userId });

    // Check the product already in the cart
    const productExists = cart.products.find((product) =>
      product.productId.equals(productId)
    );

    // Handle product found in the cart
    if (productExists) {
      // Handle stock not enough
      if (productExists.quantity + 1 > product.stock) {
        return res
          .status(400)
          .json({ message: "Cannot add more than available stock" });
      }

      // Increase product quantity
      productExists.quantity += 1;

      // Decrease stock by 1 after adding to cart
      product.stock -= 1;
      await product.save();

      // Recalculate total
      cart.calculateTotalPrice();
    } else {
      // Handle case when stock is zero
      if (product.stock < 1) {
        return res.status(400).json({ message: "Product is out of stock" });
      }

      // Add product to cart
      cart.products.push({ productId, price: product.price, quantity: 1 });

      // Decrease stock by 1 after adding to cart
      product.stock -= 1;
      await product.save();
    }

    // Recalculate total
    cart.calculateTotalPrice();

    // Save the cart
    await cart.save();

    // Send response to frontend
    res.status(200).json({ message: "Product added to cart", data: cart });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Remove product from cart
const removeProductFromCart = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Get product id
    const { productId } = req.body;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // Handle cart not found
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove product
    cart.products = cart.products
      .map((product) => {
        // Find product
        if (product.productId.equals(productId)) {
          // Check quantity greaterthan 1
          if (product.quantity > 1) {
            // Spread the array and decrease product quantity
            return { ...product, quantity: product.quantity - 1 };
          }

          // Remove product when quantity reaches 0
          return null;
        }
        // Keep other product unchanged
        return product;
      })
      // Remove null entries
      .filter(Boolean);

    // Find the product
    const product = await Product.findById(productId);

    // Increase stock by 1 after removing from cart
    if (product) {
      product.stock += 1;
      await product.save();
    }

    // Recalculate total price
    cart.calculateTotalPrice();

    // Save the cart
    await cart.save();

    // Send response to frontend
    res.status(200).json({ message: "Product removed", data: cart, new: true });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

const clearCart = async (req, res) => {
  try {
    // Get user id
    const userId = req.user.id;

    // Find cart
    const cart = await Cart.findOne({ userId });

    // Handle cart not found
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Reset products in cart
    for (let item of cart.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Clear the cart
    cart.products = [];
    cart.totalPrice = 0;

    // Save cart
    await cart.save();

    // Send response to frontend
    res.status(200).json({ message: "Cart cleared", data: cart });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Export all functions
module.exports = {
  addToCart,
  addToFromWishlistCart,
  getCart,
  addCartQuantity,
  removeProductFromCart,
  clearCart,
};