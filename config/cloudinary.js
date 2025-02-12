const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

// Config dotenv
dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Export cloudinary instance
module.exports.cloudinaryInstance = cloudinary;