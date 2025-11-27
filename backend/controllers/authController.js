const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Settings = require("../models/Settings");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// @desc    Enable 2FA - Generate QR code
// @route   POST /api/auth/2fa/enable
// @access  Private
exports.enable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("+twoFactorSecret");
        
        if (user.twoFactorEnabled) {
            return res.status(400).json({ message: "2FA is already enabled" });
        }
        
        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `SmartInvoice+ (${user.email})`,
            issuer: "SmartInvoice+"
        });
        
        // Save secret (but don't enable yet - wait for verification)
        user.twoFactorSecret = secret.base32;
        await user.save();
        
        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        
        res.json({
            message: "Scan this QR code with your authenticator app",
            qrCode: qrCodeUrl,
            secret: secret.base32,
            manualEntryKey: secret.base32
        });
        
    } catch (error) {
        console.error("Enable 2FA error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Verify and confirm 2FA setup
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id).select("+twoFactorSecret");
        
        if (!user.twoFactorSecret) {
            return res.status(400).json({ message: "2FA not initialized" });
        }
        
        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        // Enable 2FA
        user.twoFactorEnabled = true;
        await user.save();
        
        res.json({ message: "2FA enabled successfully" });
        
    } catch (error) {
        console.error("Verify 2FA error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findById(req.user.id).select("+password +twoFactorSecret");
        
        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        
        // Verify 2FA token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        // Disable 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        
        res.json({ message: "2FA disabled successfully" });
        
    } catch (error) {
        console.error("Disable 2FA error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Verify 2FA during login
// @route   POST /api/auth/2fa/verify-login
// @access  Public
exports.verify2FALogin = async (req, res) => {
    try {
        const { email, token } = req.body;
        const user = await User.findOne({ email }).select("+twoFactorSecret");
        
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: "Invalid request" });
        }
        
        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Return JWT token
        const jwtToken = generateToken(user._id);
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: jwtToken,
            businessName: user.businessName || "",
            address: user.address || "",
            phone: user.phone || "",
            profilePicture: user.profilePicture || "",
            businessLogo: user.businessLogo || ""
        });
        
    } catch (error) {
        console.error("Verify 2FA login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "No account with that email found" });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request - SmartInvoice+",
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({ message: "Password reset email sent" });
        
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Failed to send reset email", error: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        // Hash token and find user
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }
        
        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        res.json({ message: "Password reset successful. You can now login with your new password." });
        
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
// exports.googleLogin = async (req, res) => {
//     try {
//         const { token } = req.body;
        
//         // Verify Google token
//         const ticket = await googleClient.verifyIdToken({
//             idToken: token,
//             audience: process.env.GOOGLE_CLIENT_ID
//         });
        
//         const payload = ticket.getPayload();
//         const { sub: googleId, email, name, picture } = payload;
        
//         // Find or create user
//         let user = await User.findOne({ email });
        
//         if (user) {
//             // Update Google ID if not set
//             if (!user.googleId) {
//                 user.googleId = googleId;
//                 user.authProvider = "google";
//                 await user.save();
//             }
//         } else {
//             // Create new user
//             user = await User.create({
//                 name,
//                 email,
//                 googleId,
//                 authProvider: "google",
//                 password: crypto.randomBytes(32).toString("hex"), // Random password
//                 profilePicture: picture
//             });
//         }
        
//         // Update last login
//         user.lastLogin = new Date();
//         await user.save();
        
//         // Generate JWT
//         const jwtToken = generateToken(user._id);
        
//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             token: jwtToken,
//             businessName: user.businessName || "",
//             address: user.address || "",
//             phone: user.phone || "",
//             profilePicture: user.profilePicture || "",
//             businessLogo: user.businessLogo || ""
//         });
        
//     } catch (error) {
//         console.error("Google login error:", error);
//         res.status(500).json({ message: "Google authentication failed", error: error.message });
//     }
// };

// @desc    Export all user data
// @route   GET /api/auth/export-data
// @access  Private
exports.exportUserData = async (req, res) => {
    try {
        const Invoice = require("../models/Invoice");
        const Receipt = require("../models/Receipt");
        const Subscription = require("../models/Subscription");
        const Settings = require("../models/Settings");
        
        const user = await User.findById(req.user.id).select("-password");
        const invoices = await Invoice.find({ user: req.user.id });
        const receipts = await Receipt.find({ user: req.user.id });
        const subscription = await Subscription.findOne({ user: req.user.id });
        const settings = await Settings.findOne({ user: req.user.id });
        
        const exportData = {
            exportDate: new Date().toISOString(),
            user,
            invoices,
            receipts,
            subscription,
            settings
        };
        
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename=smartinvoice-data-export-${Date.now()}.json`);
        res.json(exportData);
        
    } catch (error) {
        console.error("Export data error:", error);
        res.status(500).json({ message: "Failed to export data", error: error.message });
    }
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
        const user = await User.create({name, email, password, authProvider: "local"});

        // Create default subscription
        await Subscription.create({
            user: user._id,
            plan: "free",
            status: "active",
            limits: {
                invoicesPerMonth: 10,
                receiptsPerMonth: 10,
                emailsPerMonth: 5,
                templatesAccess: ["classic", "minimal"],
                hasAds: true
            }
        });

        // Create default settings
        await Settings.create({ user: user._id });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
                businessName: user.businessName || "",
                address: user.address || "",
                phone: user.phone || "",
                profilePicture: user.profilePicture || "",
                businessLogo: user.businessLogo || ""
            });
        } else {
            res.status(400).json({message: "Invalid user data"})
        }
        
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        
        // Find or create user
        let user = await User.findOne({ email });
        
        if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                if (picture && !user.profilePicture) {
                    user.profilePicture = picture;
                }
                await user.save();
            }
        } else {
            // Create new user
            const crypto = require("crypto");
            user = await User.create({
                name,
                email,
                googleId,
                authProvider: "google",
                password: crypto.randomBytes(32).toString("hex"), // Random password
                profilePicture: picture
            });

            // Create default subscription for new user
            await Subscription.create({
                user: user._id,
                plan: "free",
                status: "active",
                limits: {
                    invoicesPerMonth: 10,
                    receiptsPerMonth: 10,
                    emailsPerMonth: 5,
                    templatesAccess: ["classic", "minimal"],
                    hasAds: true
                }
            });

            // Create default settings
            await Settings.create({ user: user._id });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate JWT
        const token = generateToken(user._id);
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
            businessName: user.businessName || "",
            address: user.address || "",
            phone: user.phone || "",
            profilePicture: user.profilePicture || "",
            businessLogo: user.businessLogo || ""
        });
        
    } catch (error) {
        console.error("Google auth error:", error);
        res.status(500).json({ message: "Google authentication failed", error: error.message });
    }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// exports.registerUser = async (req, res) => {
//     const {name, email, password} = req.body;

//     try {
//         if (!name || !email || !password) {
//             return res.status(400).json({message: "Please fill all fields."});
//         }

//         // Check if user exists
//         const userExists = await User.findOne({email});
//         if (userExists) {
//             return res.status(400).json({message: "User already exists"});
//         }

//         // Create User
//         const user = await User.create({name, email, password});

//         if (user) {
//             res.status(201).json({
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 token: generateToken(user._id),
//             });
//         } else {
//             res.status(400).json({message: "Invalid user data"})
//         }
        
//     } catch (error) {
//         res.status(500).json({message: "Server error", error: error.message});
//     }
// };

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

