const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let resource_type = 'image';
        if (file.mimetype.startsWith('video/'))        resource_type = 'video';
        if (file.mimetype === 'application/pdf')        resource_type = 'raw';

        return {
            folder:          'violations',
            resource_type,
            allowed_formats: ['jpg', 'jpeg', 'png', 'jfif', 'pdf', 'mp4', 'mov', 'avi', 'mkv']
        };
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

module.exports = upload;