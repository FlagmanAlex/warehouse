import express from 'express';
import { DocController } from '@controllers';
import { adminMiddleware, docValidators, handleValidationErrors } from '@middlewares';

export const docRouter = express.Router();

docRouter.get('/', DocController.getAllDocs);
docRouter.get('/status/:status', DocController.getDocsByStatus);
docRouter.get('/:id', DocController.getDocById);
docRouter.post('/', docValidators, handleValidationErrors, DocController.createDoc);
docRouter.patch('/:id/status', DocController.updateDocStatus);
docRouter.patch('/:id', DocController.updateDoc);
docRouter.delete('/:id', adminMiddleware, DocController.deleteDoc);