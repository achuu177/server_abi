const express = require("express");
const {
  sellerSignup,
  sellerLogin,
  sellerLogout,
  sellerProfile,
  updateSellerProfile,
  checkSeller,
  deactivateSeller,
  getSellers,
  activateSeller,
  deleteSeller,
  sellerDetails,
  getInactiveSellers,
  getActiveSellers,
  sellerResetPassword,
} = require("../controllers/sellerControllers.js");
const { sellerAuth } = require("../middlewares/sellerAuth.js");
const { adminAuth } = require("../middlewares/adminAuth.js");
const { upload } = require("../middlewares/multer.js");

// Configure router
const sellerRouter = express.Router();

// Register new seller
sellerRouter.post("/signup", upload.single("profilePicture"), sellerSignup);

// Login seller
sellerRouter.post("/login", sellerLogin);

// Display all sellers
sellerRouter.get("/sellers", adminAuth, getSellers);

// Logout seller
sellerRouter.post("/logout", sellerAuth, sellerLogout);

// Display seller profile
sellerRouter.get("/profile", sellerAuth, sellerProfile);

// Update seller profile details
sellerRouter.put(
  "/update-profile",
  upload.single("profilePicture"),
  sellerAuth,
  updateSellerProfile
);

// Deactivate seller profile
sellerRouter.put("/deactivate-profile", sellerAuth, deactivateSeller);

// Activate seller
sellerRouter.put("/activate-seller", adminAuth, activateSeller);

// Check seller when routing
sellerRouter.get("/check-seller", sellerAuth, checkSeller);

// Delete seller
sellerRouter.delete("/delete-seller", adminAuth, deleteSeller);

// Seller details
sellerRouter.get("/details/:userId", adminAuth, sellerDetails);

// Inactive sellers
sellerRouter.get("/active-sellers", adminAuth, getActiveSellers);

// Inactive sellers
sellerRouter.get("/inactive-sellers", adminAuth, getInactiveSellers);

// Forgot password
//sellerRouter.post("/forgot-password", sellerForgotPassword);

// Reset password
sellerRouter.post("/reset-password/:token", sellerResetPassword);

// Export the router
module.exports = { sellerRouter };
