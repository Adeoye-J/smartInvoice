const Invoice = require("../models/Invoice");
const Subscription = require("../models/Subscription");
const { generatePdfBufferFromInvoice } = require('../utils/pdfGenerator');

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
    try {
        const user = req.user;
        const {
            invoiceNumber,
            invoiceDate,
            dueDate,
            billFrom,
            billTo,
            items,
            notes,
            paymentTerms,
            templateId
        } = req.body;

        // Subtotal calculation
        let subTotal = 0;
        let taxTotal = 0;
        items.forEach((item) => {
            subTotal += item.unitPrice * item.quantity;
            taxTotal += ((item.unitPrice * item.quantity) * (item.taxPercent || 0)) / 100;
        })

        const total = subTotal + taxTotal;

        // Server-side quota check and increment
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

                const limit = subscription.limits?.invoicesPerMonth ?? -1;
                if (limit !== -1 && subscription.usage.invoicesCreated >= limit) {
                    return res.status(400).json({ message: `Monthly invoice limit reached (${limit}).` });
                }

                // increment now (will save after invoice saved)
                subscription.usage.invoicesCreated += 1;
                await subscription.save();
            }
        } catch (err) {
            console.warn('Subscription check failed during invoice creation:', err.message || err);
        }

        // Determine template/color defaults from user Settings if not provided
        let chosenTemplate = templateId || null;
        let chosenColor = null;
        try {
            const Settings = require('../models/Settings');
            const userSettings = await Settings.findOne({ user: req.user.id }).lean();
            if (userSettings) {
                chosenTemplate = chosenTemplate || userSettings.branding?.invoiceTemplate || userSettings.branding?.defaultTemplate || 'classic';
                chosenColor = userSettings.branding?.invoiceColor || userSettings.branding?.primaryColor || null;
            }
        } catch (err) {
            console.warn('Failed to load settings when creating invoice:', err.message || err);
            chosenTemplate = chosenTemplate || templateId || 'classic';
        }

        const invoice = new Invoice({
            user,
            invoiceNumber,
            invoiceDate,
            dueDate,
            billFrom,
            billTo,
            items,
            notes,
            paymentTerms,
            templateId: chosenTemplate,
            brandColor: chosenColor,
            subTotal,
            taxTotal,
            total,
        })

        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res
            .status(500)
            .json({message: "Error Creating Invoice", error: error.message})
    }
};

// @desc    Get all invoices of logged-in user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({user: req.user.id}).populate("user", "name email")
        res.json(invoices);
    } catch (error) {
        res
            .status(500)
            .json({message: "Error Fetching Invoice", error: error.message})
    }
};

// @desc    Get single invoice by Id
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate("user", "name email");
        if (!invoice) return res.status(404).json({message: "Invoice not found"});

        // Check if the invoice belongs to the user
        if (invoice.user._id.toString() !== req.user.id) {
            return res.status(401).json({message: "Not Authorized"});
        }

        res.json(invoice);
    } catch (error) {
        res
            .status(500)
            .json({message: "Error Fetching Invoice", error: error})
    }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
    try {
        const {
            invoiceNumber,
            invoiceDate,
            dueDate,
            billFrom,
            billTo,
            items,
            notes,
            paymentTerms,
            templateId,
            status,
        } = req.body;

        // Recalculate totals if items changed
        let subTotal = 0;
        let taxTotal = 0;
        if (items && items.length > 0) {
            items.forEach((item) => {
                subTotal += item.unitPrice * item.quantity;
                taxTotal += ((item.unitPrice * item.quantity) * (item.taxPercent || 0)) / 100;
            });
        }

        const total = subTotal + taxTotal;

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                invoiceNumber,
                invoiceDate,
                dueDate,
                billFrom,
                billTo,
                items,
                notes,
                paymentTerms,
                templateId,
                status,
                subTotal,
                taxTotal,
                total,
            },
            {new: true}
        );

        if (!updatedInvoice) return res.status(404).json({message: "Invoice not found"});

        res.json(updatedInvoice)

    } catch (error) {
        res
            .status(500)
            .json({message: "Error Updating Invoice", error: error.message})
    }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({message: "Invoice not found"});
        res.json({message: "Invoice deleted successfully"});
    } catch (error) {
        res
            .status(500)
            .json({message: "Error Deleting Invoice", error: error.message})
    }
};



// GET /api/invoices/:id/pdf   -> generate PDF on server and return it
exports.generatePdf = async (req, res) => {
// router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const invoiceId = req.params.id;

  // 1) load invoice from DB (adjust projection/populate to your needs)
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  // 2) generate pdf buffer with your utility
  const pdfBuffer = await generatePdfBufferFromInvoice(invoice);

  // 3) send PDF bytes back to client
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': pdfBuffer.length,
    'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber || invoice._id}.pdf`,
  });

  return res.send(pdfBuffer);
};

// module.exports = router;