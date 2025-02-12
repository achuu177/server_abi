const bcrypt = require("bcrypt");
const { catchErrorHandler } = require("./catchErrorHandler");

// For hashing and compare password
const passwordHandler = async (password, hashPassword, res) => {
  try {
    if (hashPassword === undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } else {
      const matchedPassword = await bcrypt.compare(password, hashPassword);
      return matchedPassword;
    }
  } catch (error) {
    // Handle catch error
    catchErrorHandler(res, error);
  }
};

module.exports = { passwordHandler };