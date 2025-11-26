// controllers/receiptController.js

const mongoose = require("mongoose");
const Receipt = require("../models/Receipt");
const Invoice = require("../models/Invoice");

// // @desc    Generate receipt from paid invoice
// // @route   POST /api/receipts/generate/:invoiceId
// // @access  Private
// exports.generateReceipt = async (req, res) => {
//     try {
//         const { invoiceId } = req.params;
//         const { paymentMethod, transactionId, paymentDate, notes } = req.body;

//         // 1. Find the invoice
//         const invoice = await Invoice.findById(invoiceId);
//         if (!invoice) {
//             return res.status(404).json({ message: "Invoice not found" });
//         }

//         // 2. Verify ownership
//         if (invoice.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Not authorized to generate receipt for this invoice" });
//         }

//         // 3. Check if invoice is paid
//         if (invoice.status !== "Paid") {
//             return res.status(400).json({ message: "Cannot generate receipt for unpaid invoice" });
//         }

//         // 4. Check if receipt already exists
//         const existingReceipt = await Receipt.findOne({ invoice: invoiceId });
//         if (existingReceipt) {
//             return res.status(400).json({ 
//                 message: "Receipt already exists for this invoice",
//                 receipt: existingReceipt 
//             });
//         }

//         // 5. Generate unique receipt number
//         const receipts = await Receipt.find({ user: req.user.id }).sort({ createdAt: -1 });
//         let maxNum = 0;
//         receipts.forEach((receipt) => {
//             const num = parseInt(receipt.receiptNumber.split("-")[1]);
//             if (!isNaN(num) && num > maxNum) maxNum = num;
//         });
//         const receiptNumber = `RCP-${String(maxNum + 1).padStart(4, "0")}`;

//         // 6. Create receipt
//         const receipt = await Receipt.create({
//             user: req.user.id,
//             invoice: invoiceId,
//             receiptNumber,
//             receiptDate: new Date(),
//             paymentMethod: paymentMethod || "Cash",
//             paymentDate: paymentDate || new Date(),
//             transactionId: transactionId || "",
//             amountPaid: invoice.total,
//             currency: "USD",
//             billFrom: invoice.billFrom,
//             billTo: invoice.billTo,
//             items: invoice.items,
//             subTotal: invoice.subTotal,
//             taxTotal: invoice.taxTotal,
//             total: invoice.total,
//             notes: notes || invoice.notes || "",
//             templateId: invoice.templateId || "classic",
//             brandColor: invoice.brandColor || "#1e40af"
//         });

//         res.status(201).json({
//             message: "Receipt generated successfully",
//             receipt
//         });

//     } catch (error) {
//         console.error("Generate receipt error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };


// controllers/receiptController.js
// const mongoose = require('mongoose');
// const Invoice = require('../models/Invoice');   // adjust path if needed
// const Receipt = require('../models/Receipt');   // adjust path if needed

// ---------- Counter model (atomic sequence) ----------
// const CounterSchema = new mongoose.Schema({
//   _id: { type: String, required: true }, // e.g. 'receiptNumber'
//   seq: { type: Number, default: 0 }
// }, { timestamps: false });

// // Avoid model overwrite errors in server restarts
// const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

// ---------- Helper: get next receipt number atomically ----------
// async function getNextReceiptNumber(counterId = 'receiptNumber') {
//   // findByIdAndUpdate with $inc and upsert gives atomic increment
//   const updated = await Counter.findByIdAndUpdate(
//     counterId,
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true, setDefaultsOnInsert: true }
//   ).lean();

//   const seq = (updated && updated.seq) ? updated.seq : 0;
//   return `RCP-${String(seq).padStart(4, '0')}`;
// }

// ---------- Controller: generateReceipt ----------
/**
 * @desc    Generate receipt from paid invoice
 * @route   POST /api/receipts/generate/:invoiceId
 * @access  Private
 */
// exports.generateReceipt = async (req, res) => {
//   try {
//     const { invoiceId } = req.params;
//     const { paymentMethod, transactionId, paymentDate, notes } = req.body;

//     // 1. Find the invoice
//     const invoice = await Invoice.findById(invoiceId);
//     if (!invoice) {
//       return res.status(404).json({ message: "Invoice not found" });
//     }

//     // 2. Verify ownership (assuming req.user.id exists)
//     if (invoice.user.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized to generate receipt for this invoice" });
//     }

//     // 3. Check if invoice is paid
//     if (invoice.status !== "Paid") {
//       return res.status(400).json({ message: "Cannot generate receipt for unpaid invoice" });
//     }

//     // 4. Check if receipt already exists for this invoice
//     const existingReceipt = await Receipt.findOne({ invoice: invoiceId });
//     if (existingReceipt) {
//       return res.status(400).json({
//         message: "Receipt already exists for this invoice",
//         receipt: existingReceipt
//       });
//     }

//     // 5. Generate unique receipt number and try to create the receipt.
//     //    We loop a couple times if a duplicate key occurs (very unlikely with counter).
//     const MAX_ATTEMPTS = 3;
//     let attempt = 0;
//     let receiptDoc = null;
//     let lastError = null;

//     while (attempt < MAX_ATTEMPTS && !receiptDoc) {
//       attempt += 1;
//       const receiptNumber = await getNextReceiptNumber();

//       try {
//         receiptDoc = await Receipt.create({
//           user: req.user.id,
//           invoice: invoiceId,
//           receiptNumber,
//           receiptDate: new Date(),
//           paymentMethod: paymentMethod || "Cash",
//           paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
//           transactionId: transactionId || "",
//           amountPaid: invoice.total,
//           currency: invoice.currency || "USD",
//           billFrom: invoice.billFrom,
//           billTo: invoice.billTo,
//           items: invoice.items,
//           subTotal: invoice.subTotal,
//           taxTotal: invoice.taxTotal,
//           total: invoice.total,
//           notes: notes || invoice.notes || "",
//           templateId: invoice.templateId || "classic",
//           brandColor: invoice.brandColor || "#1e40af"
//         });

//       } catch (err) {
//         lastError = err;
//         // If duplicate key on receiptNumber, get the next sequence and retry.
//         if (err && (err.code === 11000 || (err.keyPattern && err.keyPattern.receiptNumber))) {
//           // loop to try again
//           continue;
//         }
//         // Any other error -> rethrow to outer catch
//         throw err;
//       }
//     }

//     if (!receiptDoc) {
//       console.error('Failed to create receipt after retries:', lastError);
//       return res.status(500).json({ message: "Failed to generate receipt. Please try again." });
//     }

//     // 6. Success
//     return res.status(201).json({
//       message: "Receipt generated successfully",
//       receipt: receiptDoc
//     });

//   } catch (error) {
//     console.error("Generate receipt error:", error);

//     // If duplicate key somehow bubbles up, give a friendly response
//     if (error && error.code === 11000) {
//       return res.status(400).json({ message: "Duplicate receipt number generated. Please retry." });
//     }

//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// controllers/receiptController.js
// const mongoose = require('mongoose');
// const Invoice = require('../models/Invoice');   // adjust path if needed
// const Receipt = require('../models/Receipt');   // adjust path if needed

// ---------- Counter model (atomic sequence per key) ----------
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. 'receiptNumber_<userId>'
  seq: { type: Number, default: 0 }
}, { timestamps: false });

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

/**
 * Returns next receipt number for a user, e.g. "RCP-0001".
 * Guarantees atomic increments using a Counter document keyed by `receiptNumber_<userId>`.
 *
 * Bootstrapping logic:
 *  - If the counter doc doesn't exist yet, we compute the current max numeric suffix
 *    among that user's existing receipts and use $setOnInsert with that max so the
 *    first reserved value becomes max+1. We then $inc seq by 1 atomically.
 *
 * This is safe in concurrent environments because upsert + $setOnInsert + $inc is atomic.
 */
async function getNextReceiptNumberForUser(userId) {
  if (!userId) throw new Error('userId required for receipt number generation');

  const counterId = `receiptNumber_${userId}`;

  // Compute current max for user (numeric part). This is only used as the set-on-insert value.
  // We try to find the highest numeric suffix already present for that user.
  // If no receipts exist, maxNum will be 0.
  const lastReceipt = await Receipt.findOne({ user: userId }).sort({ createdAt: -1 }).lean();

  let maxNum = 0;
  if (lastReceipt && lastReceipt.receiptNumber) {
    // Expect format "RCP-0001" etc. Be defensive.
    const parts = lastReceipt.receiptNumber.split('-');
    const maybeNum = parseInt(parts[1], 10);
    if (!isNaN(maybeNum)) maxNum = maybeNum;
  } else {
    // If sort by createdAt didn't find anything, we can still attempt an aggregation to be safe
    // (handles cases where createdAt might not be set in older docs).
    const agg = await Receipt.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          n: {
            $toInt: {
              $arrayElemAt: [
                { $split: ["$receiptNumber", "-"] },
                1
              ]
            }
          }
        }
      },
      { $group: { _id: null, maxN: { $max: "$n" } } }
    ]);
    if (agg && agg.length > 0 && agg[0].maxN) {
      maxNum = agg[0].maxN;
    }
  }

  // Use findByIdAndUpdate with upsert and combine $setOnInsert (bootstrap value) with $inc.
  // If the doc exists, $inc will return the next seq. If it doesn't, $setOnInsert sets seq=maxNum,
  // and $inc increments it by 1 in the same atomic operation -> giving maxNum+1.
  const updated = await Counter.findByIdAndUpdate(
    counterId,
    {
      $inc: { seq: 1 },
      $setOnInsert: { seq: maxNum } // will be used only on insert
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  const seq = (updated && updated.seq) ? updated.seq : 1;
  return `RCP-${String(seq).padStart(4, '0')}`;
}

// ---------- Controller: generateReceipt ----------
/**
 * @desc    Generate receipt from paid invoice (per-user sequential receipt numbers)
 * @route   POST /api/receipts/generate/:invoiceId
 * @access  Private
 */
exports.generateReceipt = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paymentMethod, transactionId, paymentDate, notes } = req.body;
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: user not found on request' });
    }

    // 1. Find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 2. Verify ownership (assuming invoice.user is ObjectId)
    if (invoice.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to generate receipt for this invoice" });
    }

    // 3. Check if invoice is paid
    if (invoice.status !== "Paid") {
      return res.status(400).json({ message: "Cannot generate receipt for unpaid invoice" });
    }

    // 4. Check if receipt already exists for this invoice
    const existingReceipt = await Receipt.findOne({ invoice: invoiceId });
    if (existingReceipt) {
      return res.status(400).json({
        message: "Receipt already exists for this invoice",
        receipt: existingReceipt
      });
    }

    // 5. Generate unique receipt number for this user and create receipt.
    //    We'll do a few attempts if a duplicate 11000 somehow occurs.
    const MAX_ATTEMPTS = 3;
    let attempt = 0;
    let receiptDoc = null;
    let lastError = null;

    while (attempt < MAX_ATTEMPTS && !receiptDoc) {
      attempt += 1;
      const receiptNumber = await getNextReceiptNumberForUser(userId);

      try {
        receiptDoc = await Receipt.create({
          user: userId,
          invoice: invoiceId,
          receiptNumber,
          receiptDate: new Date(),
          paymentMethod: paymentMethod || "Cash",
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          transactionId: transactionId || "",
          amountPaid: invoice.total,
          currency: invoice.currency || "USD",
          billFrom: invoice.billFrom,
          billTo: invoice.billTo,
          items: invoice.items,
          subTotal: invoice.subTotal,
          taxTotal: invoice.taxTotal,
          total: invoice.total,
          notes: notes || invoice.notes || "",
          templateId: invoice.templateId || "classic",
          brandColor: invoice.brandColor || "#1e40af"
        });

      } catch (err) {
        lastError = err;

        // If duplicate key on user+receiptNumber or receiptNumber, loop to get next sequence.
        if (err && err.code === 11000 && (
          (err.keyPattern && (err.keyPattern.receiptNumber || err.keyPattern.user)) ||
          (err.message && err.message.includes('duplicate key'))
        )) {
          // continue to next attempt (get another sequence)
          continue;
        }
        // Any other error -> rethrow to outer catch
        throw err;
      }
    }

    if (!receiptDoc) {
      console.error('Failed to create receipt after retries:', lastError);
      return res.status(500).json({ message: "Failed to generate receipt. Please try again." });
    }

    // 6. Success
    return res.status(201).json({
      message: "Receipt generated successfully",
      receipt: receiptDoc
    });

  } catch (error) {
    console.error("Generate receipt error:", error);

    if (error && error.code === 11000) {
      return res.status(400).json({ message: "Duplicate receipt number generated. Please retry." });
    }

    return res.status(500).json({ message: "Server error", error: error.message });
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
