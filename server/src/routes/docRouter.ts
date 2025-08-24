import express from 'express';
import { DocController } from '@controllers';
import { adminMiddleware } from '../middleware/authMiddleware';

export const docRouter = express.Router();

// Получение списка заказов
docRouter.get('/', DocController.getAllDocs);
// Получение заказа по ID
docRouter.get('/:id', DocController.getDocById);
// Создание нового заказа
docRouter.post('/', DocController.createDoc);
//Изменение статуса заказа
docRouter.put('/:id/status', DocController.updateDocStatus);
// Проведение заказа
// docRouter.post('/:id/post', DocController.);
// Распроведение заказа
// docRouter.post('/:id/unpost', DocController.unpostDoc);
// Удаление заказа

docRouter.delete('/:id', adminMiddleware, DocController.deleteDoc);