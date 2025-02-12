const Product = require("../models/productModel.js");
const {Seller} = require("../models/sellerModel.js");
const {catchErrorHandler} = require("../utils/catchErrorHandler.js");
const {cloudinaryInstance} = require("../config/cloudinary.js");

// Add product
const addProduct = async (req, res) => {
  try {
    console.log("Product model:", Product); // Check if Product is a constructor
    console.log("Request body:", req.body); // Check request body
    console.log("Request file:", req.file); // Check uploaded file
    console.log("Seller ID:", req.user.id); // Check seller ID

    // Get data from request body
    const { title, description, price, stock, category } = req.body;

    // Handle input fields not to be empty
    if (!title || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Get seller id
    const sellerId = req.user.id;

    // Handle upload image
    const uploadResult = await cloudinaryInstance.uploader.upload(
      req.file.path
    );

    // Creating new product object
    const product = new Product({
      title,
      description,
      price,
      stock,
      category,
      image: uploadResult.url,
      seller: sellerId,
    });

    // Save new product to database
    await product.save();

    // Set product to seller
    await Seller.findOneAndUpdate(
      { _id: sellerId },
      { $push: { products: product._id } },
      { new: true }
    );

    // Send response to frontend
    res.json({ message: "Product created successfully", data: product });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    // Get all products
    const products = await Product.find();

    // Handle no product found
    if (!products.length) {
      return res.status(404).json({ message: "No product found" });
    }

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Products render successfully", data: products });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get product details
const productDetails = async (req, res) => {
  try {
    // Get product id
    const { productId } = req.params;

    // Find product by id
    const productData = await Product.findById(productId);

    // Send response to front end
    res
      .status(200)
      .json({ message: "Product details fetched", data: productData });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Update product details
const updateProductData = async (req, res) => {
  try {
    // Get product id
    const { productId } = req.params;

    // Get data from request body
    const { title, description, price, stock, category } = req.body;

    // Handle input field not be empty
    if (!title || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Handle upload image
    let imageUrl = null;

    // Upload image to cloudinary
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(
        req.file.path
      );
      imageUrl = uploadResult.url;
    }

    // Update product data
    const updatedProductData = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        description,
        price,
        stock,
        category,
        image: imageUrl || undefined,
      },
      { new: true }
    );
    // Send response to frontend
    res
      .status(200)
      .json({ message: "Product details updated", data: updatedProductData });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    // Get product id
    const { productId } = req.body;

    // Find the product by id
    const product = await Product.findByIdAndDelete(productId);

    // Handle product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send response to frontend
    res.status(200).json({ message: "Product deleted", data: product });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Category search
const productCategory = async (req, res) => {
  try {
    // Get data from body
    const { category } = req.body;

    // Handle input field not to be empty
    if (!category || category.trim() === "") {
      return res.status(400).json({ message: "Category is required" });
    }

    // Find category
    const selectedCategory = await Product.find({ category });

    // Handle response
    if (!selectedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Product category fetched", data: selectedCategory });
  } catch (error) {
    // Handel error
    catchErrorHandler(res, error);
  }
};

// Search product
const searchProduct = async (req, res) => {
  try {
    // Get data from body
    const { searchResult } = req.body;

    // Handle search query
    if (!searchResult || searchResult.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Get the search products by mongodb regular expression
    const searchResults = await Product.find({
      $or: [
        { title: { $regex: searchResult, $options: "i" } },
        { description: { $regex: searchResult, $options: "i" } },
        { category: { $regex: searchResult, $options: "i" } },
      ],
    });

    // Handle response
    if (!searchResults) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send response to frontend
    res.status(200).json({ message: "Products fetched", data: searchResults });
  } catch (error) {
    // Handel error
    catchErrorHandler(res, error);
  }
};

// Display products by seller
const getSellerProducts = async (req, res) => {
  try {
    // Get user id
    const sellerId = req.user.id;

    // Get products
    const products = await Seller.findById(sellerId).populate("products");

    // Check products exists
    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Products fetched successfully", data: products });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Search seller products
const searchSellerProducts = async (req, res) => {
  try {
    // Get user id
    const sellerId = req.user.id;

    // Get search value
    const { searchResult } = req.body;

    // Handle search query
    if (searchResult && searchResult.trim() !== "") {
      // Search for products by title, description, or category with mongodb regular expression
      const searchResults = await Product.find({
        seller: sellerId,
        $or: [
          { title: { $regex: searchResult, $options: "i" } },
          { description: { $regex: searchResult, $options: "i" } },
          { category: { $regex: searchResult, $options: "i" } },
        ],
      });

      // Handle search result
      if (!searchResults || searchResults.length === 0) {
        return res.status(404).json({ message: "No matching products found" });
      }

      // Send response to frontend
      return res
        .status(200)
        .json({ message: "Products found", data: searchResults });
    } else {
      // If no search value, return all products for the seller
      const sellerProducts = await Seller.findById(FileSystemWritableFileStreamId).populate("products");

      // Handle seller product not found
      if (!sellerProducts || !sellerProducts.products.length) {
        return res
          .status(404)
          .json({ message: "No products found for this seller" });
      }

      // Send response to frontend
      return res.status(200).json({
        message: "Products fetched successfully",
        data: sellerProducts.products,
      });
    }
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Export all functions
module.exports = {
  addProduct,
  getProducts,
  productDetails,
  updateProductData,
  deleteProduct,
  productCategory,
  searchProduct,
  getSellerProducts,
  searchSellerProducts,
};