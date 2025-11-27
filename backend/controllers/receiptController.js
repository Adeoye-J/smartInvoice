// controllers/receiptController.js

const mongoose = require("mongoose");
const Receipt = require("../models/Receipt");
const Invoice = require("../models/Invoice");
const Subscription = require("../models/Subscription");

// @desc    Generate receipt from paid invoice
// @route   POST /api/receipts/generate/:invoiceId
// @access  Private
exports.generateReceipt = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const { 
            receiptNumber,  // NOW COMES FROM FRONTEND
            paymentMethod, 
            transactionId, 
            paymentDate, 
            notes 
        } = req.body;

        // 1. Validate receipt number is provided
        if (!receiptNumber) {
            return res.status(400).json({ message: "Receipt number is required" });
        }

        // 2. Check if receipt number already exists
        const existingReceiptWithNumber = await Receipt.findOne({ receiptNumber, user: req.user.id });
        if (existingReceiptWithNumber) {
            return res.status(400).json({ message: "Receipt number already exists" });
        }

        // 3. Find the invoice
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // 4. Verify ownership
        if (invoice.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to generate receipt for this invoice" });
        }

        // 5. Check if invoice is paid
        if (invoice.status !== "Paid") {
            return res.status(400).json({ message: "Cannot generate receipt for unpaid invoice" });
        }

        // 6. Check if receipt already exists for this invoice
        const existingReceipt = await Receipt.findOne({ invoice: invoiceId });
        if (existingReceipt) {
            return res.status(400).json({ 
                message: "Receipt already exists for this invoice",
                receipt: existingReceipt 
            });
        }

        // Server-side quota check and increment for receipts
        try {
            const subscription = await Subscription.findOne({ user: req.user.id });
            if (subscription) {
                const now = new Date();
                if (!subscription.currentPeriodEnd || (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd)) {
                    subscription.usage = { invoicesCreated: 0, receiptsGenerated: 0, emailsSent: 0 };
                    subscription.currentPeriodStart = now;
                    const periodEnd = new Date();
                    periodEnd.setMonth(periodEnd.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));
                    subscription.currentPeriodEnd = periodEnd;
                }

                const limit = subscription.limits?.receiptsPerMonth ?? -1;
                if (limit !== -1 && subscription.usage.receiptsGenerated >= limit) {
                    return res.status(400).json({ message: `Monthly receipt limit reached (${limit}).` });
                }

                // increment now (save after creating receipt)
                subscription.usage.receiptsGenerated += 1;
                await subscription.save();
            }
        } catch (err) {
            console.warn('Subscription check failed during receipt generation:', err.message || err);
        }

        // 7. Create receipt - determine template/color from invoice, then user Settings as fallback
        let chosenTemplate = invoice.templateId || null;
        let chosenColor = invoice.brandColor || null;
        try {
            const Settings = require('../models/Settings');
            const userSettings = await Settings.findOne({ user: req.user.id }).lean();
            if (userSettings) {
                chosenTemplate = chosenTemplate || userSettings.branding?.receiptTemplate || userSettings.branding?.invoiceTemplate || userSettings.branding?.defaultTemplate || 'classic';
                chosenColor = chosenColor || userSettings.branding?.receiptColor || userSettings.branding?.invoiceColor || userSettings.branding?.primaryColor || '#1e40af';
            }
        } catch (err) {
            console.warn('Failed to load settings when creating receipt:', err.message || err);
            chosenTemplate = chosenTemplate || 'classic';
            chosenColor = chosenColor || '#1e40af';
        }

        const receipt = await Receipt.create({
            user: req.user.id,
            invoice: invoiceId,
            receiptNumber,  // Use frontend-generated number
            receiptDate: new Date(),
            paymentMethod: paymentMethod || "Cash",
            paymentDate: paymentDate || new Date(),
            transactionId: transactionId || "",
            amountPaid: invoice.total,
            currency: "USD",
            billFrom: invoice.billFrom,
            billTo: invoice.billTo,
            items: invoice.items,
            subTotal: invoice.subTotal,
            taxTotal: invoice.taxTotal,
            total: invoice.total,
            notes: notes || invoice.notes || "",
            templateId: chosenTemplate,
            brandColor: chosenColor
        });

        res.status(201).json({
            message: "Receipt generated successfully",
            receipt
        });

    } catch (error) {
        console.error("Generate receipt error:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "Receipt number already exists. Please try again." 
            });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all receipts for logged-in user
// @route   GET /api/receipts
// @access  Private
exports.getReceipts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            sortBy = "receiptDate", 
            order = "desc",
            search = "",
            startDate,
            endDate,
            paymentMethod
        } = req.query;

        // Build query
        const query = { user: req.user.id };

        // Search by receipt number or client name
        if (search) {
            query.$or = [
                { receiptNumber: { $regex: search, $options: "i" } },
                { "billTo.clientName": { $regex: search, $options: "i" } }
            ];
        }

        // Filter by date range
        if (startDate || endDate) {
            query.receiptDate = {};
            if (startDate) query.receiptDate.$gte = new Date(startDate);
            if (endDate) query.receiptDate.$lte = new Date(endDate);
        }

        // Filter by payment method
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        // Execute query with pagination
        const receipts = await Receipt.find(query)
            .populate("invoice", "invoiceNumber status")
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Receipt.countDocuments(query);

        res.json({
            receipts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalReceipts: count
        });

    } catch (error) {
        console.error("Get receipts error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get single receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
exports.getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id)
            .populate("invoice", "invoiceNumber status dueDate")
            .lean();

        if (!receipt) {
            return res.status(404).json({ message: "Receipt not found" });
        }

        // Verify ownership
        if (receipt.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view this receipt" });
        }

        res.json(receipt);

    } catch (error) {
        console.error("Get receipt error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get receipt by invoice ID
// @route   GET /api/receipts/invoice/:invoiceId
// @access  Private
exports.getReceiptByInvoiceId = async (req, res) => {
    try {
        const receipt = await Receipt.findOne({ invoice: req.params.invoiceId })
            .populate("invoice", "invoiceNumber status")
            .lean();

        if (!receipt) {
            return res.status(404).json({ message: "No receipt found for this invoice" });
        }

        // Verify ownership
        if (receipt.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view this receipt" });
        }

        res.json(receipt);

    } catch (error) {
        console.error("Get receipt by invoice error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update receipt (limited fields)
// @route   PUT /api/receipts/:id
// @access  Private
exports.updateReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);

        if (!receipt) {
            return res.status(404).json({ message: "Receipt not found" });
        }

        // Verify ownership
        if (receipt.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this receipt" });
        }

        // Only allow updating specific fields
        const allowedUpdates = ["notes", "paymentMethod", "transactionId"];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        Object.assign(receipt, updates);
        await receipt.save();

        res.json({
            message: "Receipt updated successfully",
            receipt
        });

    } catch (error) {
        console.error("Update receipt error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private
exports.deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);

        if (!receipt) {
            return res.status(404).json({ message: "Receipt not found" });
        }

        // Verify ownership
        if (receipt.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this receipt" });
        }

        await receipt.deleteOne();

        res.json({ message: "Receipt deleted successfully" });

    } catch (error) {
        console.error("Delete receipt error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Generate PDF for receipt
// @route   GET /api/receipts/:id/pdf
// @access  Private
exports.generateReceiptPdf = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id).lean();

        if (!receipt) {
            return res.status(404).json({ message: "Receipt not found" });
        }

        // Verify ownership
        if (receipt.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Generate PDF (we'll create this utility next)
        const { generatePdfBufferFromReceipt } = require('../utils/pdfGenerator');
        const pdfBuffer = await generatePdfBufferFromReceipt(receipt);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename=receipt-${receipt.receiptNumber}.pdf`,
        });

        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Generate receipt PDF error:", error);
        res.status(500).json({ message: "Failed to generate PDF", error: error.message });
    }
};

// @desc    Get receipt statistics
// @route   GET /api/receipts/stats
// @access  Private
exports.getReceiptStats = async (req, res) => {
    try {
        const stats = await Receipt.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalReceipts: { $sum: 1 },
                    totalAmount: { $sum: "$amountPaid" },
                    avgAmount: { $avg: "$amountPaid" }
                }
            }
        ]);

        // Payment method breakdown
        const paymentMethodStats = await Receipt.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amountPaid" }
                }
            }
        ]);

        res.json({
            summary: stats[0] || { totalReceipts: 0, totalAmount: 0, avgAmount: 0 },
            paymentMethods: paymentMethodStats
        });

    } catch (error) {
        console.error("Get receipt stats error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// module.exports = {
//     generateReceipt,
//     getReceipts,
//     getReceiptById,
//     getReceiptByInvoiceId,
//     updateReceipt,
//     deleteReceipt,
//     generateReceiptPdf,
//     getReceiptStats,
// };