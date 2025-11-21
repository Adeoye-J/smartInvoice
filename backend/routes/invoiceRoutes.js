const express = require("express");
const {createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice, generatePdf} = require("../controllers/invoiceController.js")
const {protect} = require("../middlewares/authMiddleware.js");
const { sendInvoiceByUserEmail } = require('../controllers/emailController');

const router = express.Router();

router.route("/").post(protect, createInvoice).get(protect, getInvoices);

router
    .route("/:id")
    .get(protect, getInvoiceById)
    .put(protect, updateInvoice)
    .delete(protect, deleteInvoice)

router.post('/:id/send-email', protect, sendInvoiceByUserEmail);
router.get("/:id/generate-pdf", protect, generatePdf);

module.exports = router;