const express = require("express");
const {
  addBanner,
  deleteBanner,
  getBanners,
  getBlackBanner,
  getYellowBanner,
  getSellerBanners,
  searchBanner,
  searchSellerBanners,
} = require("../controllers/bannerControllers.js");
const { upload } = require("../middlewares/multer.js");
const { sellerAuth } = require("../middlewares/sellerAuth.js");
const { adminAuth } = require("../middlewares/adminAuth.js");

// Configure router
const bannerRouter = express.Router();

// Add new banner
bannerRouter.post("/add-banner", sellerAuth, upload.single("image"), addBanner);

// Get banners
bannerRouter.get("/banners", adminAuth, getBanners);

// Search banners
bannerRouter.post("/search-banners", adminAuth, searchBanner);

// Search seller banners
bannerRouter.post("/search-seller-banners", sellerAuth, searchSellerBanners);

// Get seller banners
bannerRouter.get("/seller-banners", sellerAuth, getSellerBanners);

// Get black banner
bannerRouter.get("/black-banners", getBlackBanner);

// Get yellow banner
bannerRouter.get("/yellow-banners", getYellowBanner);

// Delete banner
bannerRouter.delete("/delete-banner", sellerAuth, deleteBanner);

module.exports = {bannerRouter};