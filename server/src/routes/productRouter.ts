import express from 'express';
import { productController } from '../controllers/productController';
import { body } from 'express-validator';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';

export const productRouter = express.Router();

// Создание товара
productRouter.post('/', productController.createProduct);

// Получение списка товаров (с фильтрами и пагинацией)
productRouter.get('/', productController.getProducts);

// Получение товара по ID
productRouter.get('/:id', productController.getProductById);

// Обновление товара
productRouter.put('/:id', productController.updateProduct);

// Архивирование товара
productRouter.patch('/:id/archive', adminMiddleware, productController.archiveProduct);

// Поиск товаров по названию
productRouter.get('/search', productController.searchProducts);

// Получение товаров поставщика
productRouter.get('/supplier/:supplierId', productController.getSupplierProducts);