import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Lazy configuration to avoid build-time errors
let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials are not set. ' +
      'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file. ' +
      'You can get these from https://cloudinary.com/console'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
}

// Export configured cloudinary instance
export function getCloudinary() {
  configureCloudinary();
  return cloudinary;
}

// Export for backward compatibility
export { cloudinary };

