
const express = require("express");
const { userRouter } = require("./userRoutes.js");
const { sellerRouter } = require("./sellerRoutes.js");
const {bannerRouter} = require("./bannerRoutes.js");
const { adminRouter } = require("./adminRoutes.js");
const { productRouter } = require("./productRoutes.js");
const { wishlistRouter } = require("./wishlistRoutes.js");
const { cartRouter } = require("./cartRoutes.js");
const { orderRouter } = require("./orderRoutes.js");
const { reviewRouter } = require("./reviewRoutes.js");
const router = express.Router();

router.use('/user', userRouter);
router.use('/seller', sellerRouter);
router.use('/banner', bannerRouter);
router.use('/admin', adminRouter);
router.use('/product', productRouter);
router.use('/wishlist', wishlistRouter);
router.use('/cart', cartRouter);
router.use('/order', orderRouter);
router.use('/review', reviewRouter);


// module.exports = router ;
module.exports = { apiRouter: router};
