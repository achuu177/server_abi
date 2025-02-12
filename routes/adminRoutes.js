 const { Router } = require("express");
const { adminAuth } = require("../middlewares/adminAuth.js");
const { upload } = require('../middlewares/multer.js');
const {
  adminProfile,
  updateAdminProfile,
  adminResetPassword,
  checkAdmin,
  adminDetails,
  adminLogout,
  adminLogin,
  adminSignup,
} = require("../controllers/adminControllers.js");

// Configure router
const adminRouter = Router();

// Admin signup
adminRouter.post('/signup',  upload.single("profilePicture"), adminSignup);

// Admin login
adminRouter.post('/login', adminLogin);

// Admin profile details
adminRouter.get("/profile", adminAuth, adminProfile);

// Update admin profile details
adminRouter.put(
  "/admin/update-profile",
  upload.single("profilePicture"),
  adminAuth,
  updateAdminProfile
);

// Admin details
adminRouter.get("/details/:userId", adminAuth, adminDetails);

// Logout admin
adminRouter.post("/logout", adminAuth, adminLogout);

// Forgot password
//adminRouter.post("/admin/forgot-password", adminForgotPassword);

// Reset password
adminRouter.post("/admin/reset-password/:token", adminResetPassword);

// Check admin when routing
adminRouter.get("/check-admin", adminAuth, checkAdmin);

// Export the router
module.exports = { adminRouter };
