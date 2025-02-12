const {Seller} = require("../models/sellerModel.js");
const {passwordHandler} = require("../utils/passwordHandler.js");
const {generateToken} = require("../utils/tokenHandler.js");
const {catchErrorHandler} = require("../utils/catchErrorHandler.js");
const {cloudinaryInstance} = require("../config/cloudinary.js");

// Seller signup
const sellerSignup = async (req, res) => {
  try {
    // Destructing data from request body
    const { name, email, password, mobile, confirmPassword } = req.body;

    // Handle input field not be empty
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check password and confirm password
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirm password not match" });
    }

    // Checking seller exists or not
    const sellerExist = await Seller.findOne({ email });
    if (sellerExist) {
      return res
        .status(400)
        .json({ message: "Seller already exist" })
        .select("-password");
    }

    // Checking mobile number exists or not
    const mobileNumberExist = await Seller.findOne({ mobile }).select(
      "-password",
    );

    if (mobileNumberExist) {
      return res.status(400).json({ message: "Mobile number already exist!" });
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

    // Creating new seller object
    const newSeller = new Seller({
      name,
      email,
      mobile,
      profilePicture: uploadResult.url,
      password: hashedPassword,
    });

    // Save new seller to database
    await newSeller.save();

    // Exclude password
    const { password: _, ...sellerWithoutPassword } = newSeller.toObject();

    // Send response to frontend
    res.status(200).json({
      message: "Seller created successfully",
      data: sellerWithoutPassword,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Seller login
const sellerLogin = async (req, res) => {
  try {
    // Get data from request body
    const { email, password } = req.body;

    // Checking fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Checking seller
    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(400).json({ message: "Seller not exist" });
    }

    // Checking password
    const matchedPassword = await passwordHandler(
      password,
      seller.password,
      res,
    );

    // Handle password does not match
    if (!matchedPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Checking seller profile
    if (!seller.isActive) {
      return res.status(400).json({ message: "Seller profile deactivated" });
    }

    // Generating token and set role
    const token = generateToken(seller, "seller", res);

    // Exclude password
    const { password: _, ...sellerWithoutPassword } = seller.toObject();

    res.status(200).json({
      message: "Login successful",
      data: sellerWithoutPassword,
      token,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Seller profile details
const sellerProfile = async (req, res) => {
  try {
    // Get seller id
    const userId = req.user.id;
    const profile = await Seller.findById(userId).select("-password");

    // Send response to frontend
    res.status(200).json({
      message: "Seller profile details fetched",
      data: profile,
    });
  } catch (error) {
    res;
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Seller details
const sellerDetails = async (req, res) => {
  try {
    // Get seller id
    const { userId } = req.params;

    // Find seller
    const seller = await Seller.findById(userId).select("-password");

    // Send response to frontend
    res.status(200).json({ message: "Seller details fetched", data: seller });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Display all sellers
const getSellers = async (req, res) => {
  try {
    // Get all sellers
    const seller = await Seller.find({ role: "seller" }).select("-password");

    // Send response to frontend
    res
      .status(200)
      .json({ message: "All sellers fetched successfully", data: seller });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

const sellerLogout = async (req, res) => {
  // Clearing token from cookies
  try {
    // Send response to frontend
    res.status(200).json({ message: "Seller logout success" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Update seller profile details
const updateSellerProfile = async (req, res) => {
  try {
    // Get data from request body
    const { name, email, mobile } = req.body;

    // Handle field not to be empty
    if (!name || !email || !mobile) {
      return res
        .status(400)
        .json({ message: "Name, email, and mobile are required" });
    }
    // Get user id
    const userId = req.user.id;

    // Handle upload image
    let profilePictureUrl = null;

    // Upload data to cloudinary
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(
        req.file.path,
      );
      profilePictureUrl = uploadResult.url;
    }

    // Update admin data
    const updatedSellerData = await Seller.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        mobile,
        profilePicture: profilePictureUrl || undefined,
      },
      { new: true },
    );
    const { password: _, ...sellerWithoutPassword } = updatedSellerData.toObject();
    // Send response to frontend
    res.status(200).json({
      message: "Seller profile details updated",
      data: sellerWithoutPassword,
    });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Check seller
const checkSeller = async (req, res) => {
  try {
    // Send response to frontend
    res.status(200).json({ message: "Authorized seller" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Deactivate seller
const deactivateSeller = async (req, res) => {
  try {
    // Get user id
    const { userId } = req.body;

    // Get seller
    const seller = await Seller.findById(userId).select("-password");

    // Handle not found
    if (!seller) {
      return res.status(404).json({ message: "No such seller found" });
    }

    // Deactivate seller
    seller.isActive = false;

    // Save data
    await seller.save();

    // Send response to frontend
    res.status(200).json({ message: "Seller deactivated", data: seller });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get inactive sellers
const getInactiveSellers = async (req, res) => {
  try {
    // Get inactive sellers
    const inactiveSellers = await Seller.find({ isActive: false }).select("-password");

    // Handle not found
    if (!inactiveSellers) {
      return res.status(404).json({ message: "No inactive seller found" });
    }
    // Send response to frontend
    res
      .status(200)
      .json({ message: "Inactive sellers fetched", data: inactiveSellers });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Get active sellers
const getActiveSellers = async (req, res) => {
  try {
    // Get active sellers
    const activeSellers = await Seller.find({ isActive: true }).select("-password");

    // Handle not found
    if (!activeSellers) {
      return res.status(404).json({ message: "No active sellers found" });
    }
    // Send response to frontend
    res
      .status(200)
      .json({ message: "Active sellers fetched", data: activeSellers });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Activate seller
const activateSeller = async (req, res) => {
  try {
    // Get user id
    const { userId } = req.body;

    // Get seller
    const seller = await Seller.findById(userId).select("-password");

    // Handle not found
    if (!seller) {
      return res.status(404).json({ message: "No inactive seller found" });
    }

    // Activate seller
    seller.isActive = true;

    // Save data
    await seller.save();

    // Send response to frontend
    res.status(200).json({ message: "Seller activated", data: seller });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Delete seller
const deleteSeller = async (req, res) => {
  try {
    // Get seller id
    const { userId } = req.body;

    // Get seller
    const seller = await Seller.findByIdAndDelete(userId).select("-password");
    // Send response to frontend
    res
      .status(200)
      .json({ message: "Seller deleted successfully", data: seller });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

// Reset password
const sellerResetPassword = async (req, res) => {
  // Get data from request body
  const { password } = req.body;

  // Get token from url
  const { token } = req.params;

  try {
    // Find the seller
    const seller = await Seller.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    // Handle seller not found
    if (!token) {
      return res
        .status(400)
        .json({ message: "Invalid token or token expired!" });
    }

    // Hashing password
    seller.password = await passwordHandler(password, undefined, res);

    // Clear tokens
    seller.resetToken = null;
    seller.resetTokenExpires = null;

    // Save seller data
    await seller.save();
    // Send response to frontend
    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};
// Export all functions
module.exports = {
  sellerSignup,
  sellerLogin,
  sellerProfile,
  sellerDetails,
  getSellers,
  sellerLogout,
  updateSellerProfile,
  checkSeller,
  deactivateSeller,
  getInactiveSellers,
  getActiveSellers,
  activateSeller,
  deleteSeller,
  sellerResetPassword,
};
