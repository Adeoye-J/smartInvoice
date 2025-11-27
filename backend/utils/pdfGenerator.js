// const path = require('path');
// const ejs = require('ejs');
// const puppeteer = require('puppeteer');

// // // Helper to generate color variants
// // function generateColorVariants(baseColor) {
// //     // Remove # if present
// //     const hex = baseColor.replace('#', '');
// //     const r = parseInt(hex.substr(0, 2), 16);
// //     const g = parseInt(hex.substr(2, 2), 16);
// //     const b = parseInt(hex.substr(4, 2), 16);
    
// //     return {
// //         primary: baseColor,
// //         primaryDark: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
// //         primaryDarker: `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`,
// //         primaryLight: `rgba(${r}, ${g}, ${b}, 0.8)`,
// //         primaryLighter: `rgba(${r}, ${g}, ${b}, 0.15)`,
// //         primaryPale: `rgba(${r}, ${g}, ${b}, 0.05)`,
// //     };
// // }

// // async function generatePdfBufferFromInvoice(invoice) {
// //     const templateName = invoice.templateId || 'classic';
// //     const templatePath = path.join(__dirname, '..', 'templates', `${templateName.toLowerCase()}.ejs`);
    
// //     const colors = generateColorVariants(invoice.brandColor || '#1e40af');
// //     const businessLogo = invoice.billFrom?.logo || null;
    
// //     const html = await ejs.renderFile(templatePath, { 
// //         invoice,
// //         colors: colors || {
// //             primary: "#0f172a",
// //             primaryPale: "#f8fafc",
// //             primaryLighter: "#cbd5e1",
// //             primaryDark: "#1e293b",
// //             primaryDarker: "#0f172a"
// //         },
// //         businessLogo
// //     });

// //     const browser = await puppeteer.launch({
// //         args: ['--no-sandbox', '--disable-setuid-sandbox']
// //     });
// //     const page = await browser.newPage();
// //     await page.setContent(html, { waitUntil: 'networkidle0' });
// //     await page.emulateMediaType('screen');

// //     const pdfBuffer = await page.pdf({
// //         format: 'A4',
// //         printBackground: true,
// //         margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
// //     });

// //     await browser.close();
// //     return pdfBuffer;
// // }

// // module.exports = { generatePdfBufferFromInvoice };




// // pdfGenerator.js
// // const path = require('path');
// const fs = require('fs');
// // const ejs = require('ejs');
// // const puppeteer = require('puppeteer');

// // /**
// //  * Return a safe hex (6 char) or fallback.
// //  */
// // function sanitizeHex(hexCandidate = '#1e40af') {
// //   if (typeof hexCandidate !== 'string') return '#1e40af';
// //   let hex = hexCandidate.trim();
// //   if (hex[0] === '#') hex = hex.slice(1);
// //   // support short form #abc -> #aabbcc
// //   if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
// //   if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '1e40af';
// //   return hex.toLowerCase();
// // }

// // /**
// //  * generate color variants from a base color hex like '#1e40af'
// //  */
// // function generateColorVariants(baseColor) {
// //   const cleanHex = sanitizeHex(baseColor);
// //   const hex = cleanHex.replace('#', '');
// //   const r = parseInt(hex.substr(0, 2), 16);
// //   const g = parseInt(hex.substr(2, 2), 16);
// //   const b = parseInt(hex.substr(4, 2), 16);

// //   function clamp(n) {
// //     return Math.max(0, Math.min(255, n));
// //   }

// //   return {
// //     primary: `#${hex}`,
// //     primaryDark: `rgb(${clamp(r - 40)}, ${clamp(g - 40)}, ${clamp(b - 40)})`,
// //     primaryDarker: `rgb(${clamp(r - 60)}, ${clamp(g - 60)}, ${clamp(b - 60)})`,
// //     primaryLight: `rgba(${r}, ${g}, ${b}, 0.8)`,
// //     primaryLighter: `rgba(${r}, ${g}, ${b}, 0.15)`,
// //     primaryPale: `rgba(${r}, ${g}, ${b}, 0.05)`
// //   };
// // }

// // /**
// //  * Convert a local file path (absolute or relative to project) to a data:image URI.
// //  * If input is already a data: URI or an http(s) url, returns input unchanged.
// //  */
// // function fileOrUrlToDataUri(src) {
// //   if (!src) return null;
// //   if (typeof src !== 'string') return null;

// //   const s = src.trim();
// //   if (s.startsWith('data:')) return s; // already data uri
// //   if (/^https?:\/\//i.test(s)) return s; // remote URL - assume accessible

// //   // treat as local file path
// //   // Resolve relative paths to project root
// //   const resolved = path.isAbsolute(s) ? s : path.join(process.cwd(), s);
// //   if (!fs.existsSync(resolved)) return null;

// //   const ext = path.extname(resolved).toLowerCase();
// //   let mime = 'application/octet-stream';
// //   if (ext === '.png') mime = 'image/png';
// //   else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
// //   else if (ext === '.svg') mime = 'image/svg+xml';
// //   else if (ext === '.webp') mime = 'image/webp';

// //   const buffer = fs.readFileSync(resolved);
// //   const b64 = buffer.toString('base64');
// //   return `data:${mime};base64,${b64}`;
// // }

// // /**
// //  * Generate PDF buffer from invoice object.
// //  * Throws an Error on failure.
// //  */
// // async function generatePdfBufferFromInvoice(invoice = {}) {
// //   let browser = null;

// //   try {
// //     // ensure template name is safe (alphanumeric + hyphen/underscore)
// //     const templateNameRaw = String(invoice.templateId || 'classic');
// //     const templateName = templateNameRaw.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase() || 'classic';

// //     const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.ejs`);
// //     if (!fs.existsSync(templatePath)) {
// //       throw new Error(`Template "${templateName}" not found at ${templatePath}`);
// //     }

// //     // safe colors
// //     const colors = generateColorVariants(invoice.brandColor || '#1e40af');

// //     // handle logo: if local path, convert to data URI
// //     const rawLogo = invoice && invoice.billFrom && invoice.billFrom.logo ? invoice.billFrom.logo : null;
// //     const businessLogo = fileOrUrlToDataUri(rawLogo);

// //     // normalize items to array so template can safely iterate
// //     if (!Array.isArray(invoice.items)) {
// //       invoice.items = Array.isArray(invoice.items) ? invoice.items : [];
// //     }

// //     // Render HTML via ejs
// //     const html = await ejs.renderFile(templatePath, {
// //       invoice,
// //       colors: colors || {
// //         primary: '#0f172a',
// //         primaryPale: '#f8fafc',
// //         primaryLighter: '#cbd5e1',
// //         primaryDark: '#1e293b',
// //         primaryDarker: '#0f172a'
// //       },
// //       businessLogo
// //     });

// //     // launch puppeteer
// //     browser = await puppeteer.launch({
// //       args: ['--no-sandbox', '--disable-setuid-sandbox']
// //       // If you need to specify executablePath for Docker/Heroku, add it here conditionally.
// //     });

// //     const page = await browser.newPage();

// //     // set a reasonable viewport for A4 (optional)
// //     await page.setViewport({ width: 1200, height: 1600 });

// //     // set content and wait until network idle so resources load (images, fonts)
// //     await page.setContent(html, { waitUntil: 'networkidle0' });

// //     // emulate screen so CSS media queries targeting screen apply
// //     await page.emulateMediaType('screen');

// //     const pdfBuffer = await page.pdf({
// //       format: 'A4',
// //       printBackground: true,
// //       margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
// //     });

// //     return pdfBuffer;
// //   } catch (err) {
// //     // give helpful message upstream
// //     throw new Error(`Failed to generate PDF: ${err.message}`);
// //   } finally {
// //     if (browser) {
// //       try { await browser.close(); } catch (e) { /* ignore */ }
// //     }
// //   }
// // }

// // module.exports = { generatePdfBufferFromInvoice };




// async function generatePdfBufferFromInvoice(invoice) {
//     const templateName = invoice.templateId || 'classic';
//     const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.ejs`);
    
//     const baseColor = invoice.brandColor || '#1e40af';
    
//     // Generate color variants
//     const hex = baseColor.replace('#', '');
//     const r = parseInt(hex.substr(0, 2), 16);
//     const g = parseInt(hex.substr(2, 2), 16);
//     const b = parseInt(hex.substr(4, 2), 16);
    
//     const colors = {
//         primary: baseColor,
//         primaryDark: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
//         primaryDarker: `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`,
//         primaryLight: `rgba(${r}, ${g}, ${b}, 0.8)`,
//         primaryLighter: `rgba(${r}, ${g}, ${b}, 0.15)`,
//         primaryPale: `rgba(${r}, ${g}, ${b}, 0.05)`,
//     };
    
//     const businessLogo = invoice.billFrom?.logo;
    
//     const html = await ejs.renderFile(templatePath, { 
//         invoice,
//         colors,
//         businessLogo
//     });

//     const browser = await puppeteer.launch({
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });
//     await page.emulateMediaType('screen');

//     const pdfBuffer = await page.pdf({
//         format: 'A4',
//         printBackground: true,
//         // margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
//     });

//     await browser.close();
//     return pdfBuffer;
// }

// // NEW: Receipt PDF Generation
// async function generatePdfBufferFromReceipt(receipt) {
//     const templateName = receipt.templateId || 'classic';
//     const templatePath = path.join(__dirname, '..', 'templates', 'receipts', `${templateName}.ejs`);
    
//     const colors = generateColorVariants(receipt.brandColor || '#1e40af');
//     const businessLogo = receipt.billFrom?.logo || null;
    
//     const html = await ejs.renderFile(templatePath, { 
//         receipt,
//         colors,
//         businessLogo
//     });

//     const browser = await puppeteer.launch({
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });
//     await page.emulateMediaType('screen');

//     const pdfBuffer = await page.pdf({
//         format: 'A4',
//         printBackground: true,
//         margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
//     });

//     await browser.close();
//     return pdfBuffer;
// }


// module.exports = { generatePdfBufferFromInvoice, generatePdfBufferFromReceipt };


// utils/pdfGenerator.js

const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const Settings = require('../models/Settings');

// Helper to generate color variants
function generateColorVariants(baseColor) {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return {
        primary: baseColor,
        primaryDark: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
        primaryDarker: `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`,
        primaryLight: `rgba(${r}, ${g}, ${b}, 0.8)`,
        primaryLighter: `rgba(${r}, ${g}, ${b}, 0.15)`,
        primaryPale: `rgba(${r}, ${g}, ${b}, 0.05)`,
    };
}

// EXISTING: Invoice PDF Generation
async function generatePdfBufferFromInvoice(invoice) {
    // If invoice doesn't include branding/template, try to load user's Settings
    let templateName = invoice.templateId || null;
    let brandColor = invoice.brandColor || null;

    if ((!templateName || !brandColor) && invoice.user) {
        try {
            const settings = await Settings.findOne({ user: invoice.user }).lean();
            if (settings) {
                // Prefer explicit invoiceTemplate/invoiceColor, then fall back to legacy defaultTemplate/primaryColor
                if (!templateName) templateName = settings.branding?.invoiceTemplate || settings.branding?.defaultTemplate;
                if (!brandColor) brandColor = settings.branding?.invoiceColor || settings.branding?.primaryColor;
            }
        } catch (err) {
            // if settings lookup fails, continue with defaults
            console.warn('Failed to load Settings for PDF generation:', err.message || err);
        }
    }

    templateName = (templateName || 'classic').toString().replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();

    // Resolve template path: prefer templates/invoices/<name>.ejs, then templates/<name>.ejs, then invoiceTemplate.ejs
    let templatePath = path.join(__dirname, '..', 'templates', 'invoices', `${templateName}.ejs`);
    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, '..', 'templates', `${templateName}.ejs`);
    }
    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, '..', 'templates', 'invoiceTemplate.ejs');
    }

    const colors = generateColorVariants(brandColor || '#1e40af');
    const businessLogo = invoice.billFrom?.logo || null;
    
    const html = await ejs.renderFile(templatePath, {
        invoice,
        colors,
        businessLogo,
        brandColor: brandColor || colors.primary
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
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });

    await browser.close();
    return pdfBuffer;
}

// NEW: Receipt PDF Generation
async function generatePdfBufferFromReceipt(receipt) {
    let templateName = receipt.templateId || null;
    let brandColor = receipt.brandColor || null;

    if ((!templateName || !brandColor) && receipt.user) {
        try {
            const settings = await Settings.findOne({ user: receipt.user }).lean();
            if (settings) {
                if (!templateName) templateName = settings.branding?.receiptTemplate || settings.branding?.defaultTemplate;
                if (!brandColor) brandColor = settings.branding?.primaryColor;
            }
        } catch (err) {
            console.warn('Failed to load Settings for receipt PDF generation:', err.message || err);
        }
    }

    templateName = (templateName || 'classic').toString().replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();

    // Resolve template path for receipts: templates/receipts/<name>.ejs, or fallback to templates/receipts/classic.ejs
    let templatePath = path.join(__dirname, '..', 'templates', 'receipts', `${templateName}.ejs`);
    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, '..', 'templates', 'receipts', `classic.ejs`);
    }

    const colors = generateColorVariants(brandColor || '#1e40af');
    const businessLogo = receipt.billFrom?.logo || null;
    
    const html = await ejs.renderFile(templatePath, { 
        receipt,
        colors,
        businessLogo,
        brandColor: brandColor || colors.primary
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
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });

    await browser.close();
    return pdfBuffer;
}

module.exports = { 
    generatePdfBufferFromInvoice,
    generatePdfBufferFromReceipt
};
