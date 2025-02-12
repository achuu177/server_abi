const jwt = require("jsonwebtoken");
const { catchErrorHandler } = require("../utils/catchErrorHandler.js");

// Handle admin authentication
const adminAuth = async (req, res, next) => {
  try {
    // Get token
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    // Handle token not found
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Decoding token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle no decoded
    if (!decoded) {
      return res.status(401).json({ message: "Admin not authorized" });
    }

    // Checking role
    if (decoded.role !== "admin") {
      return res.status(404).json({ message: "User not authorized" });
    }

    // Set admin
    req.user = decoded;
    next();
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

module.exports = { adminAuth };