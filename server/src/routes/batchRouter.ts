import { Router } from 'express';
import { BatchController } from '@controllers';

export const batchRouter = Router();

//Создание новой партии
batchRouter.post('/', BatchController.createBatch);

//Получение партии по ID
batchRouter.get('/:id', BatchController.getBatchById);

//Получение всех партий товара
batchRouter.get('/product/:productId', BatchController.getBatchesByProduct)

//Обновление статуса партии
batchRouter.patch('/:id/status', BatchController.updateBatchStatus)


