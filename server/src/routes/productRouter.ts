import express from 'express';
import { productController } from '@controllers';
import { adminMiddleware } from '@middlewares';
import { productValidators, handleValidationErrors } from '@middlewares';

export const productRouter = express.Router();

// Статические маршруты — до параметрических
productRouter.get('/search', productController.searchProducts);
productRouter.get('/supplier/:supplierId', productController.getSupplierProducts);

productRouter.get('/', productController.getProducts);
productRouter.post('/', productValidators, handleValidationErrors, productController.createProduct);
productRouter.get('/:id', productController.getProductById);
productRouter.patch('/:id/archive', adminMiddleware, productController.archiveProduct);
productRouter.patch('/:id', productController.updateProduct);