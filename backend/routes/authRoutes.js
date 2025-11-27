const express = require("express")
const { uploadProfilePicture: uploadProfileImg, uploadBusinessLogo: uploadBizLogo } = require('../utils/uploadConfig');
const {registerUser, loginUser, getMe, updateUserProfile, getGoogleAuthUrl, handleGoogleCallback, uploadLogo, uploadBusinessLogo, uploadProfilePicture, enable2FA, verify2FA, disable2FA, verify2FALogin, forgotPassword, resetPassword, googleLogin, exportUserData, googleAuth } = require("../controllers/authController")
const {protect} = require("../middlewares/authMiddleware")
// const upload = require('../utils/uploadConfig');

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateUserProfile);

// Profile/Logo uploads
router.post("/upload-profile-picture", protect, uploadProfileImg.single("profilePicture"), uploadProfilePicture);
router.post("/upload-business-logo", protect, uploadBizLogo.single("businessLogo"), uploadBusinessLogo);

// 2FA routes
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/verify", protect, verify2FA);
router.post("/2fa/disable", protect, disable2FA);
router.post("/2fa/verify-login", verify2FALogin);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Google OAuth
router.post("/google", googleAuth);

// Data export
router.get("/export-data", protect, exportUserData);


// router.get('/google/url', protect, getGoogleAuthUrl);
// router.get('/google/callback', protect, handleGoogleCallback);


module.exports = router;