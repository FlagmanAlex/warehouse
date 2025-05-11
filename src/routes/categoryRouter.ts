import express from 'express';
import { categoryController } from '../controllers/categoryController';

export const categoryRouter = express.Router();

categoryRouter.post('/', categoryController.createCategory);
categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/tree', categoryController.getCategoryTree); // Опционально
categoryRouter.get('/:id', categoryController.getCategoryById);
categoryRouter.get('/:id/products', categoryController.getCategoryProducts); // Опционально
categoryRouter.patch('/:id', categoryController.updateCategory);
categoryRouter.delete('/:id', categoryController.deleteCategory);