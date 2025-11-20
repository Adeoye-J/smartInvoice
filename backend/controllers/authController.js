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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// exports.loginUser = async (req, res) => {
//     const {email, password} = req.body;

//     try {
//         const user = await User.findOne({email}).select("+password");

//         if (user && (await user.matchPassword(password))) {
//             res.json({
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 token: generateToken(user._id),

//                 businessName: user.businessName || "",
//                 address: user.address || "",
//                 phone: user.phone || "",
//             });
//         } else {
//             res.status(401).json({message: "Invalid credentials."})
//         }
//     } catch (error) {
//         res.status(500).json({message: "Server error", error: error.message});
//     }
// }

// LOGIN (fixed .select and explicit status handling)
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

    // success: return user info + token
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      businessName: user.businessName || "",
      address: user.address || "",
      phone: user.phone || "",
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
