const jwt = require("jsonwebtoken");
const { catchErrorHandler } = require("./catchErrorHandler.js");

// For generating token
const generateToken = (user, role, res) => {
  try {
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET);
    return token;
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

module.exports = { generateToken };