// // controllers/receiptController.js

// const Receipt = require("../models/Receipt");
// const Invoice = require("../models/Invoice");
// const { generatePdfBufferFromReceipt } = require("../utils/pdfGenerator");

// // @desc    Generate receipt from paid invoice
// // @route   POST /api/receipts/generate/:invoiceId
// // @access  Private
// exports.generateReceipt = async (req, res) => {
//     try {
//         const { invoiceId } = req.params;
//         const { paymentMethod, transactionReference, paymentDate, notes } = req.body;

//         // 1. Find invoice and verify ownership
//         const invoice = await Invoice.findById(invoiceId);
//         if (!invoice) {
//             return res.status(404).json({ message: "Invoice not found" });
//         }

//         if (invoice.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         // 2. Check if invoice is paid
//         if (invoice.status !== "Paid") {
//             return res.status(400).json({ message: "Invoice must be marked as Paid before generating receipt" });
//         }

//         // 3. Check if receipt already exists for this invoice
//         const existingReceipt = await Receipt.findOne({ invoice: invoiceId });
//         if (existingReceipt) {
//             return res.status(400).json({ 
//                 message: "Receipt already exists for this invoice",
//                 receipt: existingReceipt 
//             });
//         }

//         // 4. Create receipt with invoice snapshot
//         const receipt = await Receipt.create({
//             invoice: invoiceId,
//             user: req.user.id,
//             paymentDate: paymentDate || Date.now(),
//             paymentMethod: paymentMethod || "Bank Transfer",
//             transactionReference: transactionReference || "",
//             amountPaid: invoice.total,
//             notes: notes || "",
//             templateId: invoice.templateId || "classic",
//             brandColor: invoice.brandColor || "#1e40af",
//             invoiceSnapshot: {
//                 invoiceNumber: invoice.invoiceNumber,
//                 invoiceDate: invoice.invoiceDate,
//                 dueDate: invoice.dueDate,
//                 billFrom: invoice.billFrom,
//                 billTo: invoice.billTo,
//                 items: invoice.items,
//                 subTotal: invoice.subTotal,
//                 taxTotal: invoice.taxTotal,
//                 total: invoice.total,
//                 notes: invoice.notes,
//             },
//         });

//         // 5. Populate invoice reference for response
//         await receipt.populate("invoice");

//         res.status(201).json({
//             message: "Receipt generated successfully",
//             receipt,
//         });
//     } catch (error) {
//         console.error("Generate receipt error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// // @desc    Get all receipts for logged-in user
// // @route   GET /api/receipts
// // @access  Private
// exports.getAllReceipts = async (req, res) => {
//     try {
//         const receipts = await Receipt.find({ user: req.user.id })
//             .populate("invoice", "invoiceNumber status")
//             .sort({ createdAt: -1 });

//         res.json({
//             count: receipts.length,
//             receipts,
//         });
//     } catch (error) {
//         console.error("Get receipts error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// // @desc    Get single receipt by ID
// // @route   GET /api/receipts/:id
// // @access  Private
// exports.getReceiptById = async (req, res) => {
//     try {
//         const receipt = await Receipt.findById(req.params.id).populate("invoice");

//         if (!receipt) {
//             return res.status(404).json({ message: "Receipt not found" });
//         }

//         // Verify ownership
//         if (receipt.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         res.json(receipt);
//     } catch (error) {
//         console.error("Get receipt error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// // @desc    Get receipt by invoice ID
// // @route   GET /api/receipts/invoice/:invoiceId
// // @access  Private
// exports.getReceiptByInvoiceId = async (req, res) => {
//     try {
//         const receipt = await Receipt.findOne({ invoice: req.params.invoiceId }).populate("invoice");

//         if (!receipt) {
//             return res.status(404).json({ message: "No receipt found for this invoice" });
//         }

//         // Verify ownership
//         if (receipt.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         res.json(receipt);
//     } catch (error) {
//         console.error("Get receipt by invoice error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// // @desc    Update receipt
// // @route   PUT /api/receipts/:id
// // @access  Private
// exports.updateReceipt = async (req, res) => {
//     try {
//         const receipt = await Receipt.findById(req.params.id);

//         if (!receipt) {
//             return res.status(404).json({ message: "Receipt not found" });
//         }

//         // Verify ownership
//         if (receipt.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         // Update allowed fields only
//         const { paymentMethod, transactionReference, paymentDate, notes, templateId, brandColor } = req.body;

//         if (paymentMethod) receipt.paymentMethod = paymentMethod;
//         if (transactionReference !== undefined) receipt.transactionReference = transactionReference;
//         if (paymentDate) receipt.paymentDate = paymentDate;
//         if (notes !== undefined) receipt.notes = notes;
//         if (templateId) receipt.templateId = templateId;
//         if (brandColor) receipt.brandColor = brandColor;

//         await receipt.save();

//         res.json({
//             message: "Receipt updated successfully",
//             receipt,
//         });
//     } catch (error) {
//         console.error("Update receipt error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// // @desc    Delete receipt
// // @route   DELETE /api/receipts/:id
// // @access  Private
// exports.deleteReceipt = async (req, res) => {
//     try {
//         const receipt = await Receipt.findById(req.params.id);

//         if (!receipt) {
//             return res.status(404).json({ message: "Receipt not found" });
//         }

//         // Verify ownership
//         if (receipt.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         await receipt.deleteOne();

//         res.json({ message: "Receipt deleted successfully" });
//     } catch (error) {
//         console.error("Delete receipt error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// // @desc    Generate PDF for receipt
// // @route   GET /api/receipts/:id/pdf
// // @access  Private
// exports.generateReceiptPdf = async (req, res) => {
//     try {
//         const receipt = await Receipt.findById(req.params.id);

//         if (!receipt) {
//             return res.status(404).json({ message: "Receipt not found" });
//         }

//         // Verify ownership
//         if (receipt.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         // Generate PDF buffer
//         const pdfBuffer = await generatePdfBufferFromReceipt(receipt);

//         // Send PDF
//         res.set({
//             "Content-Type": "application/pdf",
//             "Content-Length": pdfBuffer.length,
//             "Content-Disposition": `attachment; filename=receipt-${receipt.receiptNumber}.pdf`,
//         });

//         return res.send(pdfBuffer);
//     } catch (error) {
//         console.error("Generate receipt PDF error:", error);
//         res.status(500).json({ message: "Failed to generate PDF", error: error.message });
//     }
// };

// // @desc    Get receipt statistics
// // @route   GET /api/receipts/stats
// // @access  Private
// exports.getReceiptStats = async (req, res) => {
//     try {
//         const receipts = await Receipt.find({ user: req.user.id });

//         const stats = {
//             totalReceipts: receipts.length,
//             totalAmountReceived: receipts.reduce((sum, receipt) => sum + receipt.amountPaid, 0),
//             paymentMethods: {},
//             recentReceipts: await Receipt.find({ user: req.user.id })
//                 .sort({ createdAt: -1 })
//                 .limit(5)
//                 .populate("invoice", "invoiceNumber"),
//         };

//         // Count by payment method
//         receipts.forEach((receipt) => {
//             stats.paymentMethods[receipt.paymentMethod] = 
//                 (stats.paymentMethods[receipt.paymentMethod] || 0) + 1;
//         });

//         res.json(stats);
//     } catch (error) {
//         console.error("Get receipt stats error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// module.exports = {
//     generateReceipt,
//     getAllReceipts,
//     getReceiptById,
//     getReceiptByInvoiceId,
//     updateReceipt,
//     deleteReceipt,
//     generateReceiptPdf,
//     getReceiptStats,
// };