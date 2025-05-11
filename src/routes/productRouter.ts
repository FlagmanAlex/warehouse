import { Router } from 'express';
import { productController } from '../controllers/productController';

export const productRouter = Router();

productRouter.post('/', productController.createProduct);                   // Создание товара
productRouter.get('/', productController.getProducts);                      // Получение списка товаров (с фильтрами и пагинацией)
productRouter.get('/:id', productController.getProductById);                // Получение товара по ID
productRouter.put('/:id', productController.updateProduct);                 // Обновление товара
productRouter.patch('/:id/archive', productController.archiveProduct);      // Архивирование товара
productRouter.get('/search', productController.searchProducts);             // Поиск товаров по названию
productRouter.get('/supplier/:supplierId', productController.getSupplierProducts); // Получение товаров поставщика
