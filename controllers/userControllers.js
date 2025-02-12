
const { User } = require("../models/userModel.js");
const { passwordHandler } = require("../utils/passwordHandler.js");
const { generateToken } = require("../utils/tokenHandler.js");
const { catchErrorHandler } = require("../utils/catchErrorHandler.js");
const { cloudinaryInstance } = require("../config/cloudinary.js");

// User signup
const userSignup = async (req, res) => {
  try {
    // Get data from request body
    const { name, email, mobile, password, confirmPassword } = req.body;

    // Handle input field not to be empty
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check password and confirm password
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirm password not match" });
    }

    // Checking user exists or not
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ message: "User already exist" })
        .select("-password");
    }

    // Checking mobile number exists or not
    const mobileNumberExist = await User.findOne({ mobile });
    if (mobileNumberExist) {
      return res
        .status(400)
        .json({ message: "Mobile number already exist!" })
        .select("-password");
    }

    // Hashing password
    const hashedPassword = await passwordHandler(password, undefined, res);

    // Handle profile picture not found
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Profile picture required!" });
    }

    // Upload profile picture to cloudinary
    const uploadResult = await cloudinaryInstance.uploader.upload(
      req.file.path,
    );

    // Creating new user object
    const newUser = new User({
      name,
      email,
      mobile,
      profilePicture: uploadResult.url,
      password: hashedPassword,
    });

    // Save new user to database
    await newUser.save();

    // Exclude password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    // Send response to frontend
    res.status(200).json({
      message: "User created successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// User login
const userLogin = async (req, res) => {
  try {
    // Get data from request body
    const { email, password } = req.body;

    // Handle fields not to be empty
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Checking user
    const user = await User.findOne({ email });

    // Handle user not found
    if (!user) {
      return res.status(404).json({ message: "User not exist" });
    }

    // Checking password
    const matchedPassword = await passwordHandler(password, user.password, res);

    // Handle password does not match
    if (!matchedPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Checking user profile
    if (!user.isActive) {
      return res.status(400).json({ message: "User profile deactivated" });
    }

    // Generating token
    const token = generateToken(user, "user", res);

    // Exclude password
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Login successful", data: userWithoutPassword, token });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Display all users
const getUsers = async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select("-password");

    // Send response to frontend
    res
      .status(200)
      .json({ message: "All users fetched successfully", data: users });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// User profile details
const userProfile = async (req, res) => {
  try {
    // Get user id
    const { id } = req.user;

    // Find user profile
    const profile = await User.findById(id).select("-password");

    // Send response to frontend
    res
      .status(200)
      .json({ message: "user profile details fetched", data: profile });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// User logout
const userLogout = async (req, res) => {
  try {
    // Send response to frontend
    res.status(200).json({ message: "User logout success" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Update user profile details
const updateUserProfile = async (req, res) => {
  try {
    // Get data from request body
    const { name, email, mobile } = req.body;

    // Handle field not be empty
    if (!name || !email || !mobile) {
      return res
        .status(400)
        .json({ message: "Name, email, and mobile are required" });
    }
    // Get user id
    const userId = req.user.id;

    // Handle upload image
    let profilePictureUrl = null;

    // Save profile picture to cloudinary
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(
        req.file.path,
      );
      profilePictureUrl = uploadResult.url;
    }

    // Update user data
    const updatedUserData = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        mobile,
        profilePicture: profilePictureUrl || undefined,
      },
      { new: true },
    );
    const { password: _, ...userWithoutPassword } = updatedUserData.toObject();
    // Send response to frontend
    res
      .status(200)
      .json({ message: "user profile details updated",  data: userWithoutPassword });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// User details
const userDetails = async (req, res) => {
  try {
    // Get user id
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId).select("-password");

    // Send response to frontend
    res.status(200).json({ message: "User details fetched", data: user });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Checking user
const checkUser = async (req, res) => {
  try {
    // Send response to frontend
    res.status(200).json({ message: "Authorized user" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get inactive users
const getInactiveUsers = async (req, res) => {
  try {
    // Get inactive users
    const inactiveUsers = await User.find({ isActive: false }).select("-password");

    // Handle not found
    if (!inactiveUsers) {
      return res.status(404).json({ message: "No inactive user found" });
    }
    // Send response to frontend
    res
      .status(200)
      .json({ message: "Inactive users fetched", data: inactiveUsers });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    // Get user id
    const { userId } = req.body;

    // Get user
    const user = await User.findById(userId).select("-password");

    // Handle not found
    if (!user) {
      return res.status(404).json({ message: "No such seller found" });
    }

    // Deactivate user
    user.isActive = false;

    // Save data
    await user.save();

    // Send response to frontend
    res.status(200).json({ message: "User deactivated", data: user });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    // Get user id
    const { userId } = req.body;

    // Get user
    const inactiveUser = await User.findById(userId).select("-password");

    // Handle not found
    if (!inactiveUser) {
      return res.status(404).json({ message: "No inactive user found" });
    }

    // Activate user
    inactiveUser.isActive = true;

    // Save data
    await inactiveUser.save();

    // Send response to frontend
    res.status(200).json({ message: "User activated" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    // Get user id
    const { userId } = req.body;

    // Get user
    const user = await User.findByIdAndDelete(userId).select("-password");
    // Send response to frontend
    res.status(200).json({ message: "User deleted", data: user });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get active users
const getActiveUsers = async (req, res) => {
  try {
    // Get active users
    const activeUsers = await User.find({ isActive: true }).select("-password");

    // Handle not found
    if (!activeUsers) {
      return res.status(404).json({ message: "No active users found" });
    }
    // Get response to frontend
    res
      .status(200)
      .json({ message: "Active Users fetched", data: activeUsers });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Reset password
const userResetPassword = async (req, res) => {
  // Get data from request body
  const { password } = req.body;
  // Get token
  const { token } = req.params;

  try {
    // Find the user
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    // Handle user not found
    if (!token) {
      return res
        .status(400)
        .json({ message: "Invalid token or token expired!" });
    }

    // Hashing password
    user.password = await passwordHandler(password, undefined, res);

    // Clear tokens
    user.resetToken = null;
    user.resetTokenExpires = null;

    // Save user data
    await user.save();
    // Send response to frontend
    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};


// Export all functions
module.exports = {
  userSignup,
  userLogin,
  getUsers,
  userProfile,
  userLogout,
  updateUserProfile,
  userDetails,
  checkUser,
  getInactiveUsers,
  deactivateUser,
  activateUser,
  deleteUser,
  getActiveUsers,
  userResetPassword,
};

