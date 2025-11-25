// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('cloudinary').v2;

// // Configure Cloudinary
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Setup storage
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'business-logos',
//         allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
//         transformation: [{ width: 300, height: 300, crop: 'limit' }]
//     }
// });

// const upload = multer({ 
//     storage: storage,
//     limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
// });

// module.exports = upload;

// utils/uploadConfig.js

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile-pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ 
            width: 400, 
            height: 400, 
            crop: 'fill',
            gravity: 'face'  // Smart crop focusing on faces
        }]
    }
});

// Create storage for business logos
const businessLogoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'business-logos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
        transformation: [{ 
            width: 500, 
            height: 500, 
            crop: 'limit'  // Maintain aspect ratio
        }]
    }
});

// Create multer instances
const uploadProfilePicture = multer({ 
    storage: profilePictureStorage,
    limits: { 
        fileSize: 3 * 1024 * 1024  // 3MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'), false);
        }
    }
});

const uploadBusinessLogo = multer({ 
    storage: businessLogoStorage,
    limits: { 
        fileSize: 5 * 1024 * 1024  // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, SVG, and WEBP are allowed.'), false);
        }
    }
});

module.exports = { 
    uploadProfilePicture, 
    uploadBusinessLogo,
    // cloudinary  // Export in case you need it elsewhere
};