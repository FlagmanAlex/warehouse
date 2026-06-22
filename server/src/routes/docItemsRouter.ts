import express from 'express';
import { DocItemsController } from '@controllers';

export const docItemsRouter = express.Router();

// Добавление элемента в заказ
docItemsRouter.post('/', DocItemsController.addItem);

// Удаление элемента из заказа
docItemsRouter.delete('/:id', DocItemsController.removeItem);