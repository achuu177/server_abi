const express = require("express");
const {
  userSignup,
  userLogin,
  userLogout,
  userProfile,
  updateUserProfile,
  checkUser,
  deactivateUser,
  getUsers,
  getInactiveUsers,
  activateUser,
  deleteUser,
  getActiveUsers,
  userResetPassword,
  userDetails,
} = require("../controllers/userControllers.js");
const { userAuth } = require("../middlewares/userAuth.js");
const { adminAuth } = require("../middlewares/adminAuth.js");
const { upload } = require("../middlewares/multer.js");

// Configure router
const userRouter = express.Router();

// Register new user
userRouter.post("/signup", upload.single("profilePicture"), userSignup);


// Login user
userRouter.post("/login", userLogin);

// Display all users
userRouter.get('/users', adminAuth, getUsers);

// Logout user
userRouter.post("/logout", userAuth, userLogout);

// Display user profile
userRouter.get("/profile", userAuth, userProfile);

// User details
userRouter.get("/details/:userId", userAuth, userDetails);

// Update user profile details
userRouter.put("/update-profile", upload.single("profilePicture"), userAuth, updateUserProfile);

// Deactivate user profile
userRouter.put("/deactivate-profile", userAuth, deactivateUser);

// Display all inactive users
userRouter.get('/users-inactive', adminAuth, getInactiveUsers);

// Activate user
userRouter.put('/activate-user', adminAuth, activateUser);

// Check user when routing
userRouter.get("/check-user", userAuth, checkUser);

// Delete user
userRouter.delete('/delete-user', adminAuth, deleteUser);

// Display inactive users
userRouter.get('/inactive-users', adminAuth, getInactiveUsers);

// Display active users
userRouter.get('/active-users', adminAuth, getActiveUsers);

// Reset password
userRouter.post("/reset-password/:token", userResetPassword);

module.exports = {userRouter};
