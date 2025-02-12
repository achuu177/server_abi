const { catchErrorHandler } = require("../utils/catchErrorHandler.js");
const { generateToken } = require("../utils/tokenHandler.js");
const { Seller } = require("../models/sellerModel.js");
const { passwordHandler } = require("../utils/passwordHandler.js");
const { cloudinaryInstance } = require("../config/cloudinary.js");


// Admin signup
const adminSignup = async (req, res) => {
  try {
    // Destructing data from request body
    const {
      name,
      email,
      password,
      mobile,
      confirmPassword,
      role = "admin",
    } = req.body;

    // Handle any field is empty
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check password and confirm password
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirm password not match" });
    }

    // Checking admin exists
    const adminExist = await Seller.findOne({ email, role: "admin" }).select(
      "-password",
    );

    // Handle admin found
    if (adminExist) {
      return res.status(400).json({ message: "Admin already exists!" });
    }

    // Checking mobile number exists
    const mobileNumberExist = await Seller.findOne({
      mobile,
      role: "admin",
    }).select("-password");

    if (mobileNumberExist) {
      return res.status(400).json({ message: "Mobile number already exists!" });
    }

    // Hashing password
    const hashedPassword = await passwordHandler(password, undefined, res);

    // Handle profile picture not found
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Profile picture required!" });
    }

    // Handle upload image
    const uploadResult = await cloudinaryInstance.uploader.upload(
      req.file.path,
    );

    // Creating new admin object
    const newAdmin = new Seller({
      name,
      email,
      mobile,
      role,
      profilePicture: uploadResult.url,
      password: hashedPassword,
    });

    // Save new admin to database
    await newAdmin.save();

    // Exclude password
    const { password: _, ...adminWithoutPassword } = newAdmin.toObject();

    // Send response to frontend
    res.json({
      message: "Admin created successfully",
      data: adminWithoutPassword,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Checking fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Checking admin
    let admin = await Seller.findOne({ email, role: "admin" });

    // Handle admin not found
    if (!admin) {
      return res.status(400).json({ message: "Admin not exist" });
    }

    // Checking password
    const matchedPassword = await passwordHandler(
      password,
      admin.password,
      res,
    );

    // Handle password not match
    if (!matchedPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Checking admin profile
    if (!admin.isActive) {
      return res.status(400).json({ message: "Admin profile deactivated" });
    }

    // Generating token and set role
    const token = generateToken(admin, "admin", res);

    // Exclude password
    const { password: _, ...adminWithoutPassword } = admin.toObject();

    // Send response to frontend
    res
      .status(200)
      .json({ message: "Login successful", data: adminWithoutPassword, token });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Admin profile details
const adminProfile = async (req, res) => {
  try {
    // Get seller id
    const userId = req.user.id;
    const profile = await Seller.findById(userId).select("-password");

    res.status(200).json({
      message: "Admin profile details fetched",
      data: profile,
    });
  } catch (error) {
    res;
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Update admin profile details
const updateAdminProfile = async (req, res) => {
  try {
    // Destructure request body
    const { name, email, mobile } = req.body;

    // Check if name, email, or mobile are missing
    if (!name || !email || !mobile) {
      return res
        .status(400)
        .json({ message: "Name, email, and mobile are required" });
    }
    // Get user id
    const userId = req.user.id;

    // Handle upload image
    let profilePictureUrl = null;

    // Upload file to cloudinary
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(
        req.file.path,
      );
      profilePictureUrl = uploadResult.url;
    }

    // Update admin data
    const updatedAdminData = await Seller.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        mobile,
        profilePicture: profilePictureUrl || undefined,
      },
      { new: true },
    );
    const { password: _, ...adminWithoutPassword } = updatedAdminData.toObject();

    // Send response to frontend
    res.status(200).json({
      message: "Admin profile details updated",
      data: adminWithoutPassword,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Reset password
const adminResetPassword = async (req, res) => {
  // Get data from request body
  const { password } = req.body;

  // Get token from url
  const { token } = req.params;

  try {
    // Find the admin
    const admin = await Seller.findOne({
      resetToken: token,
      role: "admin",
      resetTokenExpires: { $gt: Date.now() },
    });

    // Handle admin not found
    if (!token) {
      return res
        .status(400)
        .json({ message: "Invalid token or token expired!" });
    }

    // Hashing password
    admin.password = await passwordHandler(password, undefined, res);

    // Clear tokens
    admin.resetToken = null;
    admin.resetTokenExpires = null;

    // Save admin data
    await admin.save();

    // Send response to frontend
    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Admin details
const adminDetails = async (req, res) => {
  try {
    // Get admin id
    const { userId } = req.params;

    // Find admin
    const admin = await Seller.findById(userId);

    // Send response to frontend
    res.status(200).json({ message: "Admin details fetched", data: admin });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Admin logout
const adminLogout = async (req, res) => {
  try {
    // Send response to frontend
    res.status(200).json({ message: "Admin logout success" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Check admin
const checkAdmin = async (req, res) => {
  try {
    // Send response to frontend
    res.status(200).json({ message: "Authorized admin" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

module.exports = {
  adminSignup,
  adminLogin,
  adminProfile,
  updateAdminProfile,
  adminResetPassword,
  adminDetails,
  adminLogout,
  checkAdmin,
};
