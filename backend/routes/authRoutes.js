const express = require("express")
const { uploadProfilePicture, uploadBusinessLogo } = require('../utils/uploadConfig');
const {registerUser, loginUser, getMe, updateUserProfile, getGoogleAuthUrl, handleGoogleCallback, uploadLogo, uploadBusinessLogo: uploadBusinessLogoController, uploadProfilePicture: uploadProfilePictureController } = require("../controllers/authController")
const {protect} = require("../middlewares/authMiddleware")
// const upload = require('../utils/uploadConfig');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.route("/me").get(protect, getMe).put(protect, updateUserProfile);
router.get('/google/url', protect, getGoogleAuthUrl);
router.get('/google/callback', protect, handleGoogleCallback);
// router.post('/upload-logo', protect, upload.single('logo'), uploadLogo);
router.post('/upload-profile-picture', protect, uploadProfilePicture.single('profilePicture'), uploadProfilePictureController);
router.post('/upload-business-logo', protect, uploadBusinessLogo.single('businessLogo'), uploadBusinessLogoController);

module.exports = router;