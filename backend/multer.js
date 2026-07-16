import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from './config/cloudinary.js';

/*const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'gagepack_certificates',
        resource_type: 'auto', // supports pdf + images
    },
});*/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp');           // ✅ use /tmp on Render (ephemeral safe)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

export default upload;