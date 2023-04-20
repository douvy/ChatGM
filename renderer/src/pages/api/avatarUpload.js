// pages/api/upload.js
import { config, v2 as cloudinary } from 'cloudinary';

config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async (req, res) => {
  if (req.method === 'POST') {
    const { image } = req.body;

    try {
      const response = await cloudinary.uploader.upload(image, {
        upload_preset: 'bssaeyfu',
      });
      console.log("avatar response:", response);

      res.status(200).json({ avatarUrl: response.secure_url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Image upload failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

