const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        businessName: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        google: {
            // store refresh token and when connected
            refreshToken: { type: String },
            connectedAt: { type: Date }
        },
        businessLogo: {
            type: String,
            default: ""
        },
        profilePicture: {
            type: String,
            default: ""
        },
        brandColor: {
            type: String,
            default: '#1e40af' // default blue
        },
        // Security
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            select: false
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        
        // OAuth
        googleId: String,
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },
        
        // Last login
        lastLogin: Date
    },
    { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password =  await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema)