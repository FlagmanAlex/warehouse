import express from 'express';
import { DocItemsController } from '@controllers';

export const docItemssRouter = express.Router();

// Добавление элемента в заказ
docItemssRouter.post('/', DocItemsController.addItem);

// Удаление элемента из заказа
docItemssRouter.delete('/:id', DocItemsController.removeItem);