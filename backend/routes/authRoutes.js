const express = require("express")
const {registerUser, loginUser, getMe, updateUserProfile, getGoogleAuthUrl, handleGoogleCallback } = require("../controllers/authController")
const {protect} = require("../middlewares/authMiddleware")

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.route("/me").get(protect, getMe).put(protect, updateUserProfile);
router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);

module.exports = router;