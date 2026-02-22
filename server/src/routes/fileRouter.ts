import express from 'express';
import { fileController } from '@controllers';

export const fileRouter = express.Router();

fileRouter.post('/', fileController.uploadFile);
fileRouter.delete('/', fileController.deleteFile);