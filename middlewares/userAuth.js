const jwt = require("jsonwebtoken");
const { catchErrorHandler } = require("../utils/catchErrorHandler.js");

const userAuth = async (req, res, next) => {
  try {
    // Get token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // Handle no token
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Decoding token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Handle no decoded
    if (!decoded) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // Set user
    req.user = decoded;

    next();
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

module.exports = { userAuth };