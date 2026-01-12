import express from 'express';
import { DocController } from '@controllers';
import { adminMiddleware } from '../middlewares/authMiddleware';

export const docRouter = express.Router();


docRouter.get('/', DocController.getAllDocs);                       // Получение списка заказов
docRouter.get('/:id', DocController.getDocById);                    // Получение заказа по ID
docRouter.get('/status/:status', DocController.getDocsByStatus);    // Получение заказов по статусу документа
docRouter.post('/', DocController.createDoc);                       // Создание нового заказа
docRouter.patch('/:id/status', DocController.updateDocStatus);      // Изменение статуса заказа
docRouter.patch('/:id', DocController.updateDoc);                   // Обновление заказа

// Проведение заказа
// docRouter.post('/:id/post', DocController.);
// Распроведение заказа
// docRouter.post('/:id/unpost', DocController.unpostDoc);

docRouter.delete('/:id', adminMiddleware, DocController.deleteDoc); // Удаление заказа