// const asyncHandler = require('express-async-handler');
// const Invoice = require('../models/Invoice');
// const User = require('../models/User');
// const { generatePdfBufferFromInvoice } = require('../utils/pdfGenerator');
// const { sendMailUsingUserOAuth } = require('../utils/emailSenderOAuth2');

// /**
//  * POST /api/invoices/:id/send-email
//  * body: { message: "..." }
//  * - will find invoice by :id
//  * - find invoice.owner (User) and their google.refreshToken
//  * - generate PDF from invoice data
//  * - send email using the owner's Gmail (OAuth2)
//  */
// const sendInvoiceByUserEmail = asyncHandler(async (req, res) => {
//   const invoiceId = req.params.id;
//   const { message } = req.body;
//   // 1) load invoice and ensure owner exists
//   const invoice = await Invoice.findById(invoiceId).lean();
//   if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

//   if (!invoice.owner) return res.status(400).json({ message: 'Invoice owner not set' });
//   const owner = await User.findById(invoice.owner);
//   if (!owner) return res.status(404).json({ message: 'Owner user not found' });

//   const refreshToken = owner.google?.refreshToken;
//   const userEmail = owner.email;
//   if (!refreshToken) return res.status(400).json({ message: 'Owner has not connected Gmail' });

//   // 2) generate PDF buffer from invoice
//   const pdfBuffer = await generatePdfBufferFromInvoice(invoice);

//   // 3) prepare email details
//   const to = invoice.billTo?.email;
//   if (!to) return res.status(400).json({ message: 'Client email missing in invoice' });

//   const subject = `Reminder: Invoice ${invoice.invoiceNumber || invoice._id}`;
//   const textBody = message || `Hello ${invoice.billTo?.clientName || ''},\nThis is a reminder regarding invoice ${invoice.invoiceNumber || ''}.`;
//   const htmlBody = `<p>${textBody.replace(/\n/g, '<br/>')}</p>`;

//   // 4) send using owner's OAuth2
//   const info = await sendMailUsingUserOAuth({
//     userEmail,
//     refreshToken,
//     to,
//     subject,
//     text: textBody,
//     html: htmlBody,
//     attachments: [
//       {
//         filename: `invoice-${invoice.invoiceNumber || invoice._id}.pdf`,
//         content: pdfBuffer,
//         contentType: 'application/pdf'
//       }
//     ]
//   });

//   res.json({ success: true, message: 'Email sent', info });
// });

// module.exports = { sendInvoiceByUserEmail };



const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { generatePdfBufferFromInvoice } = require('../utils/pdfGenerator');
const { sendMailUsingUserOAuth } = require('../utils/emailSenderOAuth2');

const sendInvoiceByUserEmail = asyncHandler(async (req, res) => {
  const invoiceId = req.params.id;
  const { message } = req.body;

  // 1) Load invoice
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice)
    return res.status(404).json({ message: 'Invoice not found' });

  // ---- FIX HERE ----
  if (!invoice.user)
    return res.status(400).json({ message: 'Invoice owner missing (invoice.user)' });

  // 2) Load the actual owner (correct field is invoice.user)
  const owner = await User.findById(invoice.user);
  if (!owner)
    return res.status(404).json({ message: 'User account not found' });

  // 3) Check Gmail OAuth connection
  const refreshToken = owner.google?.refreshToken;
  const userEmail = owner.email;

  if (!refreshToken)
    return res.status(400).json({ message: 'User has not connected Gmail' });

  // 4) Generate PDF server-side
  const pdfBuffer = await generatePdfBufferFromInvoice(invoice);

  // 5) Prepare email values
  const to = invoice.billTo?.email;
  if (!to)
    return res.status(400).json({ message: 'Client email missing in invoice' });

  const subject = `Invoice ${invoice.invoiceNumber} Reminder`;
  
  const textBody =
    message ||
    `Hello ${invoice.billTo?.clientName || ''},\nThis is a reminder regarding your invoice.`;

  const htmlBody = `<p>${textBody.replace(/\n/g, '<br/>')}</p>`;

  // 6) Send the email using OAuth2
  const info = await sendMailUsingUserOAuth({
    userEmail,      // <--- the sender user email
    userDisplayName: owner.businessName || owner.name,
    refreshToken,   // <--- their linked Gmail OAuth token
    to,
    subject,
    text: textBody,
    html: htmlBody,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  res.json({ success: true, message: `Email sent`, info });
});

module.exports = { sendInvoiceByUserEmail };
