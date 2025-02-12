const Product = require("../models/productModel.js");
const {Review} = require("../models/reviewModel.js");
const {Order} = require("../models/orderModel.js");
const { catchErrorHandler } = require("../utils/catchErrorHandler.js");

// Add new review
const addReview = async (req, res) => {
  try {
    // Get data from request body
    const { productId, rating, comment } = req.body;

    // Get user
    const userId = req.user.id;

    // Handle no user id
    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // Find the product with product id
    const product = await Product.findById(productId);

    // Handle product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check the user has purchased the product
    const order = await Order.findOne({
      userId: userId,
      "products.productId": productId,
      orderStatus: "delivered",
    });

    // Handle user has not purchased product
    //if (!order) {
     // return res
        //.status(400)
       // .json({ message: "You must purchase the product to add your review!" });
   // }

    // Check if the user has already reviewed this product
    const existingReview = await Review.findOne({
      productId: productId,
      userId: userId,
    });

    // Handle already reviewed
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Create or update the review
    const review = await Review.findOneAndUpdate(
      { userId, productId },
      { rating, comment },
      { new: true, upsert: true }
    );

    // Save review to data base
    await review.save();

    // Send response to frontend
    res.status(200).json({
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    // Handle errors
    catchErrorHandler(res, error);
  }
};

// Display product review
const getProductReview = async (req, res) => {
  try {
    // Get product id
    const productId = req.params.id;

    // Find reviews
    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    // Handle review not found
    // if (!reviews) {
    //   return res
    //     .status(404)
    //     .json({ message: "No reviews found for this product" });
    // }

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Review fetched successfully", data: reviews });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    // Get review id
    const { reviewId } = req.body;

    // Get user id
    const userId = req.user.id;

    // Find and delete review
    const review = await Review.findOneAndDelete({ _id: reviewId, userId });

    // Handle review not found
    if (!review) {
      // Send response to frontend
      res.status(404).json({ message: "Review not found or not authorized" });
    }

    // Send response to frontend
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get average rating
const getAverageRating = async (req, res) => {
  try {
    // Get product id
    const { productId } = req.body;

    // Find reviews
    const reviews = await Review.find({ productId });

    // Handle reviews not found
    // if (!reviews.length) {
    //   // Send response to frontend
    //   return res
    //     .status(404)
    //     .json({ message: "No reviews found for this product", data: 0 });
    // }

    // Calculate average rating
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Average rating fetched", data: averageRating });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Export functions
module.exports = {
  addReview,
  getProductReview,
  deleteReview,
  getAverageRating,
};