const express = require("express");
const {
  addProduct,
  productDetails,
  updateProductData,
  deleteProduct,
  getProducts,
  productCategory,
  searchProduct,
  getSellerProducts,
  searchSellerProducts,
} = require("../controllers/productControllers.js");
const {upload} = require("../middlewares/multer.js");
const {sellerAuth} = require("../middlewares/sellerAuth.js");

// Configure router
const productRouter = express.Router();

// Add new product
productRouter.post(
  "/add-product",
  sellerAuth,
  upload.single("image"),
  addProduct
);

// Display products
productRouter.get("/products", getProducts);

// Display products based seller
productRouter.get("/seller-products", sellerAuth, getSellerProducts);

// Display products by category
productRouter.post("/category", productCategory);

// Display products by search
productRouter.post("/search", searchProduct);

// Display product details
productRouter.get("/product-details/:productId", productDetails);

// Update product details
productRouter.put(
  "/update-product/:productId",
  upload.single("image"),
  sellerAuth,
  updateProductData
);

// Delete product
productRouter.delete("/delete-product", sellerAuth, deleteProduct);

// Search seller products
productRouter.post("/search-seller-products", sellerAuth, searchSellerProducts);

// Export the router
module.exports = {productRouter};