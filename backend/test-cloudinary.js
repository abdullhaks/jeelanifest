const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'thcsfhit',
  api_key: '628596593646717',
  api_secret: '5st89pnUEQ-BmpWCSPPeZIPgjAQ'
});

// A small 1x1 transparent PNG buffer
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const uploadStream = cloudinary.uploader.upload_stream(
  {
    folder: `jeelanifest/test`,
    resource_type: 'image',
  },
  (error, result) => {
    if (error) {
      console.error('❌ Upload failed', error);
      process.exit(1);
    } else {
      console.log('✅ Upload successful. URL:', result.secure_url);
      process.exit(0);
    }
  }
);
uploadStream.end(buffer);
