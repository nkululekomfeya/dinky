import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.cloud_name,       // ✅ lowercase
    api_key: process.env.api_key,             // ✅ lowercase
    api_secret: process.env.api_secret,       // ✅ lowercase
});

export default cloudinary;