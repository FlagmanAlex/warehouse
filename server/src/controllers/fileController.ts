import multer from 'multer';
import { Request, Response } from 'express';
import fs from 'fs/promises'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

export const uploadFile = upload.single('image');

export const fileController = {
  uploadFile: async (req: Request, res: Response) => {
    try {
      await uploadFile
      console.log(req.file?.filename);
      
      res.status(200).json({ imageUrl: req.file?.filename, message: 'Image uploaded successfully' });
    } catch (err) {
      res.status(500).send({ message: 'Error uploading image' });
    }
  },

  deleteFile: async (req: Request, res: Response) => {
    try {
      const { filename } = req.body;
      await fs.unlink(`images/${filename}`);
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (err) {
      res.status(500).send({ message: 'Error deleting image' });
    }
  }
}
