// controllers/settingsController.js

const Settings = require("../models/Settings");

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user.id });
        
        // Create default settings if none exist
        if (!settings) {
            settings = await Settings.create({ user: req.user.id });
        }
        
        res.json(settings);
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user.id });
        
        if (!settings) {
            settings = await Settings.create({ user: req.user.id, ...req.body });
        } else {
            // Deep merge for nested objects
            if (req.body.invoiceDefaults) {
                settings.invoiceDefaults = { ...settings.invoiceDefaults, ...req.body.invoiceDefaults };
            }
            if (req.body.branding) {
                settings.branding = { ...settings.branding, ...req.body.branding };
            }
            if (req.body.notifications) {
                settings.notifications = { ...settings.notifications, ...req.body.notifications };
            }
            if (req.body.emailTemplates) {
                settings.emailTemplates = { ...settings.emailTemplates, ...req.body.emailTemplates };
            }
            // if (req.body.paymentGateway) {
            //     settings.paymentGateway = { ...settings.paymentGateway, ...req.body.paymentGateway };
            // }
            
            await settings.save();
        }
        
        res.json({ message: "Settings updated successfully", settings });
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// module.exports = {
//     getSettings,
//     updateSettings
// };