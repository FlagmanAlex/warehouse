import { Router } from 'express';
import { categoryController } from '@controllers';

export const categoryRouter = Router();

// Создание новой категории
categoryRouter.post('/', categoryController.createCategory);

// Получение списка всех категорий
categoryRouter.get('/', categoryController.getAllCategories);

// Получение дерева категорий (опционально)
categoryRouter.get('/tree', categoryController.getCategoryTree);

// Получение категории по ID
categoryRouter.get('/:id', categoryController.getCategoryById);

// Получение товаров по категории (опционально)
categoryRouter.get('/:id/products', categoryController.getCategoryProducts);

// Обновление категории
categoryRouter.patch('/:id', categoryController.updateCategory);

// Удаление категории
categoryRouter.delete('/:id', categoryController.deleteCategory)