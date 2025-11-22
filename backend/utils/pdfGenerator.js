const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

async function generatePdfBufferFromInvoice(invoice) {
//   const templatePath = path.join(__dirname, '..', 'templates', 'invoiceTemplate.ejs');
//   const templatePath = path.join(__dirname, '..', 'templates', 'classic.ejs');
    const templatePath = path.join(__dirname, '..', 'templates', `${(invoice.templateId).toLowerCase()}.ejs`);
//   const html = await ejs.renderFile(templatePath, { invoice });
  // In generatePdfBufferFromInvoice function
    const html = await ejs.renderFile(templatePath, { 
        invoice,
        businessLogo: invoice.billFrom.logo || null // Pass logo
    });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('screen');

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generatePdfBufferFromInvoice };
