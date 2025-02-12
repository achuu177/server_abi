const express = require("express");
const {
  addReview,
  getProductReview,
  getAverageRating,
  deleteReview,
} = require("../controllers/reviewControllers.js");
const { userAuth } = require("../middlewares/userAuth.js");

// Configure router
const reviewRouter = express.Router();

// Add review
reviewRouter.post("/add-review", userAuth, addReview);

// Display product review
reviewRouter.get("/get-review/:id", getProductReview);

// Get average review
reviewRouter.post("/get-avg-rating", getAverageRating);

// Delete review
reviewRouter.delete("/delete-review", userAuth, deleteReview);

module.exports = {reviewRouter};