const { Order } = require("../models/orderModel.js");
const  Product  = require("../models/productModel.js");
const { catchErrorHandler } = require("../utils/catchErrorHandler.js");

const createOrder = async (req, res) => {
  try {
    const { products, totalPrice, shippingAddress } = req.body;
    const userId = req.user.id; 

    // Validate required fields
    if (!products || !totalPrice || !shippingAddress) {
      return res.status(400).json({ 
        message: "Please provide all required fields (products, totalPrice, shippingAddress)" 
      });
    }

    // Create new order
    const newOrder = await Order.create({
      userId,
      products,
      totalPrice,
      shippingAddress,
      orderStatus: "processing", // matching your enum values
      paymentStatus: "pending",
      returnStatus: "eligible",
      returnApprovalStatus: "pending"
    });

    res.status(201).json({
      message: "Order created successfully!",
      data: newOrder
    });

  } catch (error) {
    catchErrorHandler(res, error);
  }
};



// Get all orders
const getOrders = async (req, res) => {
  try {
    // Get orders
    console.log("Fetching orders...");
    const orders = await Order.find();
    console.log("Orders fetched: ", orders);
    // Handle order not found
    if (!orders) {
      return res.status(404).json({ message: "No orders found!" });
    }

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Orders fetched successfully!", data: orders });
     
  } catch (error) {
    catchErrorHandler(res, error);
  }
};

// Filter orders by status
const getOrdersByStatus = async (req, res) => {
  try {
    // Get status from request body
    const { status } = req.body;

    // Find and populate order data
    const ordersByStatus = await Order.find({ orderStatus: status }).populate(
      "products.productId",
      "title"
    );

    // Handle no status found
    if (!ordersByStatus) {
      return res.status(404).json({ message: "No orders found!" });
    }

    // Send data to frontend
    res.status(200).json({
      message: "Orders by status fetched successfully!",
      data: ordersByStatus,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    // Get order id from url
    const { orderId } = req.params;

    // Get order details
    const ordersDetails = await Order.findById(orderId).populate(
      "products.productId",
      "title image price"
    );

    // Handle no order details found
    if (!ordersDetails) {
      return res.status(404).json({ message: "No order details found!" });
    }

    // Send data to frontend
    res.status(200).json({
      message: "Order details fetched successfully!",
      data: ordersDetails,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get seller orders
const getSellerOrders = async (req, res) => {
  try {
    // Get seller id
    const userId = req.user.id;

    // Handle seller id not found
    if (!userId) {
      return res.status(400).json({ error: "Seller not found" });
    }

    // Find all products associated with the seller
    const sellerProducts = await Product.find({ seller: userId }).select("_id");

    // Handle no product found
    if (!sellerProducts.length) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }

    // Collect seller product ids
    const productIds = sellerProducts.map((product) => product._id);

    // Find all orders containing products associated with this seller
    let orders = await Order.find({
      "products.productId": { $in: productIds },
    }).populate("products.productId", "title price image");

    // Handle no data
    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this seller" });
    }
    // Send response to frontend
    res.status(200).json({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get seller orders by status
const getSellerOrdersByStatus = async (req, res) => {
  try {
    // Get seller id
    const userId = req.user.id;

    // Get status
    const { status } = req.body;

    // Handle seller not found
    if (!userId) {
      return res.status(400).json({ error: "Seller not found" });
    }

    // Find all products associated with the seller
    const sellerProducts = await Product.find({ seller: userId }).select("_id");

    // Handle no product found
    if (!sellerProducts.length) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }

    // Collect seller product ids
    const productIds = sellerProducts.map((product) => product._id);

    // Find all orders containing products associated with this seller
    let ordersByStatus = await Order.find({
      "products.productId": { $in: productIds },
    }).populate("products.productId", "title price image");

    // Handle order status not found
    if (!ordersByStatus.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this seller" });
    }

    // Filter the orders by status
    if (status) {
      ordersByStatus = ordersByStatus.filter(
        (order) => order.orderStatus === status
      );
    }
    // Send response to frontend
    res.status(200).json({
      message: "Orders fetched successfully",
      data: ordersByStatus,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Change order status
const handleOrderStatus = async (req, res) => {
  try {
    // Get order id
    const { orderId, status } = req.body;

    // Handle status is not found
    if (!status) {
      return res.status(400).json({ message: "Provide status" });
    }

    // Handle order id not found
    if (!orderId) {
      return res.status(400).json({ message: "Provide orderId" });
    }

    // Find order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: status,
      },
      { new: true }
    );

    // Handle order not found case
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send response to frontend
    res.status(200).json({ message: "Order status updated", data: order });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get user order
const getUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Handle not user id not found
    if (!userId) {
      return res.status(400).json({ message: "User id not found" });
    }

    // Get user order details
    const userOrder = await Order.find({ userId })

      .populate("products.productId", "title price image quantity")
      .exec();

    // Handle orders not found
    if (!userOrder) {
      return res.status(404).json({ message: "No order found" });
    }

    // Send response to frontend
    return res
      .status(200)
      .json({ message: "User order fetched successfully", data: userOrder });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

const updateStock = async (req, res) => {
  try {
    // Get uer id from request user
    const userId = req.user.id;

    // Find the most recent order for the user and populate product details
    const order = await Order.findOne({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("products.productId");

    // Handle order not found
    if (!order) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // Update stock for each product in the order
    await Promise.all(
      order.products.map(async (item) => {
        const product = item.productId;
        if (product) {
          // Decrease stock quantity and manage stock quantity not to be zero
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      })
    );
    // Send response to frontend
    return res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get total price by product category from all orders
const getOrderTotalPriceByCategory = async (req, res) => {
  try {
    // Find all products in the database
    const products = await Product.find().select("_id category");

    // Handle no products found
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    // Store product ids
    const productIds = products.map((product) => product._id);

    // Find all orders containing products
    const orders = await Order.find({
      "products.productId": { $in: productIds },
    })
      // Populate category field from product
      .populate("products.productId", "title price image category")

      // Select product fields
      .select("products orderStatus totalPrice createdAt");

    // Handle order not found
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Create new object for storing category total price
    const categoryTotalPrice = {};

    orders.forEach((order) => {
      order.products.forEach((product) => {
        // Get category from populated product data
        const category = product.productId.category;

        // Get the product quantity
        const quantity = product.quantity;

        // Get product price
        const price = product.productId.price;

        // Calculate total price for the category
        const totalProductPrice = price * quantity;

        // Calculate the total price per category
        if (categoryTotalPrice[category]) {
          categoryTotalPrice[category] += totalProductPrice;
        } else {
          categoryTotalPrice[category] = totalProductPrice;
        }
      });
    });

    // Format the data
    const formattedCategoryTotalPrice = Object.keys(categoryTotalPrice).map(
      (category) => ({
        category,
        totalPrice: categoryTotalPrice[category],
      })
    );

    // Send response to the frontend
    res.status(200).json({
      message: "Total price by category fetched successfully",
      data: formattedCategoryTotalPrice,
    });
  } catch (error) {
    // Handle error
    catchErrorHandler(res, error);
  }
};

// Get total price by product category by seller orders
const getSellerOrderTotalPriceByCategory = async (req, res) => {
  try {
    // Get seller id
    const userId = req.user.id;

    // Handle seller not found
    if (!userId) {
      return res.status(400).json({ error: "Seller not found" });
    }

    // Find seller products
    const sellerProducts = await Product.find({ seller: userId }).select(
      "_id category price"
    );

    // Handle no products found
    if (!sellerProducts.length) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }

    // Store seller product ids
    const productIds = sellerProducts.map((product) => product._id);

    // Find seller orders
    const orders = await Order.find({
      "products.productId": { $in: productIds },
    })
      // Populate category, title, price, and image from product
      .populate("products.productId", "title price image category")

      // Select product fields
      .select("products totalPrice orderStatus createdAt");

    // Handle order not found
    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this seller" });
    }

    // Create new object to store category based total price data
    const categoryTotalPrice = {};

    orders.forEach((order) => {
      order.products.forEach((product) => {
        // Get category from populated product data
        const category = product.productId.category;

        // Get quantity from the order
        const quantity = product.quantity;

        // Get product price
        const price = product.productId.price;

        // Calculate the total product price
        const totalProductPrice = price * quantity;

        // Calculate total price by category
        if (categoryTotalPrice[category]) {
          categoryTotalPrice[category] += totalProductPrice;
        } else {
          categoryTotalPrice[category] = totalProductPrice;
        }
      });
    });

    // Format the data
    const formattedCategoryTotalPrice = Object.keys(categoryTotalPrice).map(
      (category) => ({
        category,
        totalPrice: categoryTotalPrice[category],
      })
    );

    // Send response to frontend
    res.status(200).json({
      message: "Seller orders by category total price fetched successfully",
      data: formattedCategoryTotalPrice,
    });
  } catch (error) {
    // Handle error
    catchErrorHandler(res, error);
  }
};

// Search orders by orderId
const searchOrders = async (req, res) => {
  try {
    const { searchResult, status } = req.body;

    // Trim search query
    if (searchResult && searchResult.trim() !== "") {
      // Search by orderStatus and orderId
      const searchResults = await Order.find({
        orderStatus: status,
        _id: searchResult,
      });

      // Handle search query not found
      if (!searchResults || searchResults.length === 0) {
        return res.status(404).json({ message: "No matching orders found" });
      }

      // Send response to frontend
      return res.status(200).json({
        message: "Orders fetched successfully",
        data: searchResults,
      });
    } else {
      return res.status(400).json({ message: "Invalid search input" });
    }
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Search seller orders by status and orderId
const searchSellerOrders = async (req, res) => {
  try {
    // Get user id from request user
    const userId = req.user.id;

    // Get data from request body
    const { searchResult, status } = req.body;

    // Handle user id not found
    if (!userId) {
      return res.status(400).json({ message: "Seller not found" });
    }

    // Find all product IDs associated with the seller
    const sellerProducts = await Product.find({ seller: userId }).select("_id");

    // Handle seller product not found
    if (!sellerProducts.length) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }

    // Store seller products ids
    const productIds = sellerProducts.map((product) => product._id);

    // Handle search query
    if (searchResult && searchResult.trim() !== "") {
      // Search by orderStatus and  orderId
      const searchResults = await Order.find({
        _id: searchResult,
        orderStatus: status,
        "products.productId": { $in: productIds },

        // Populate data
      }).populate("products.productId", "title price image");

      // Handle search query not found
      if (!searchResults || searchResults.length === 0) {
        return res.status(404).json({ message: "No matching orders found" });
      }

      // Send response to frontend
      return res.status(200).json({
        message: "Orders fetched successfully",
        data: searchResults,
      });
    } else {
      // Handle invalid input
      return res.status(400).json({ message: "Invalid search input" });
    }
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrdersByStatus,
  getOrderDetails,
  getSellerOrders,
  getSellerOrdersByStatus,
  handleOrderStatus,
  getUserOrder,
  updateStock,
  getOrderTotalPriceByCategory,
  getSellerOrderTotalPriceByCategory,
  searchOrders,
  searchSellerOrders,
};
