const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({message: "Please fill all fields."});
        }

        // Check if user exists
        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({message: "User already exists"});
        }

        // Create User
        const user = await User.create({name, email, password});

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({message: "Invalid user data"})
        }
        
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findById(req.user.id);

        // Optional: Delete old image from Cloudinary
        if (user.profilePicture) {
            const publicId = user.profilePicture.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        user.profilePicture = req.file.path;
        await user.save();

        res.json({
            message: "Profile picture uploaded successfully",
            profilePicture: user.profilePicture
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

// Upload business logo
exports.uploadBusinessLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findById(req.user.id);

        // Optional: Delete old image from Cloudinary
        if (user.businessLogo) {
            const publicId = user.businessLogo.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        user.businessLogo = req.file.path;
        await user.save();

        res.json({
            message: "Business logo uploaded successfully",
            businessLogo: user.businessLogo
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // include password field (assuming password field is select: false on schema)
    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");

    // if no user or password doesn't match
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        businessName: user.businessName || "",
        address: user.address || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",  // ADD
        businessLogo: user.businessLogo || ""       // ADD
    });

  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {

    try {
        const user = await User.findById(req.user.id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            businessName: user.businessName || "",
            address: user.address || "",
            phone: user.phone || "",
            logo: user.logo || ""
        });

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateUserProfile = async (req, res) => {

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.businessName = req.body.businessName || user.businessName;
            user.address = req.body.address || user.address;
            user.phone = req.body.phone || user.phone;

            const updateUser = await user.save()

            res.json({
                _id: updateUser._id,
                name: updateUser.name,
                email: updateUser.email,
                businessName: updateUser.businessName,
                address: updateUser.address,
                phone: updateUser.phone,
            });
        } else {
            res.status(404).json({message: "User not found."})
        }
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// ----------------------------------------------------------


// server/controllers/authController.js
const asyncHandler = require('express-async-handler');
// const User = require('../models/User');
const { createOAuth2Client } = require('../utils/googleClient');
// const jwt = require('jsonwebtoken');

/**
 * GET /api/auth/google/url
 * returns the Google OAuth URL the frontend should open
 */
exports.getGoogleAuthUrl = asyncHandler(async (req, res) => {
  const oauth2Client = createOAuth2Client();
  // we request gmail.send scope
  const scopes = ['https://www.googleapis.com/auth/gmail.send'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',  // gets a refresh token
    scope: scopes,
    prompt: 'consent' // force consent so refresh_token is returned first time
  });

  res.json({ url });
});

/**
 * GET /api/auth/google/callback?code=...
 * Exchange code for tokens, get user email, save refresh token for that user.
 * In a real app you'd authenticate the current user (session or JWT) and attach the refresh token to them.
 * For demo, this example uses a query param ?userId=... to link the refresh token to a user in DB.
 */
exports.handleGoogleCallback = asyncHandler(async (req, res) => {
  const { code, state, userId } = req.query; // frontend can include state or userId
  if (!code) return res.status(400).send('Missing code');

  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  // tokens contains access_token, refresh_token (refresh_token only on first consent), expiry_date, etc.
  const refreshToken = tokens.refresh_token;

  // Use the access token to get user profile (email)
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;
  const name = userInfo.data.name;

  // Find or create user by email, then save refresh token
  let user = await User.findOne({ email });
  if (!user) {
    // If you want to allow signup on connect:
    user = await User.create({ email, name });
  }

  if (refreshToken) {
    user.google.refreshToken = refreshToken;
    user.google.connectedAt = new Date();
    await user.save();
  } else {
    // On subsequent consents Google may not return refresh_token. If user already has it stored, we're fine.
    // If not, instruct user to use "prompt=consent" or disconnect/reconnect.
    console.warn('No refresh token returned. Ensure prompt=consent on first connect.');
  }

  // This route is called by Google redirect - return a friendly page or redirect user back to app.
  // If your app uses JWT sessions, you could link the current logged-in user by cookie or state param.
  res.send(`<html><body>
    <h3>Google account connected for ${email}</h3>
    <p>You can close this window and return to the app.</p>
  </body></html>`);
});

