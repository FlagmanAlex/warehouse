import express from 'express';
import { OrderDetailsController } from '../controllers/orderDetailsController';

export const orderDetailsRouter = express.Router();

// Добавление элемента в заказ
orderDetailsRouter.post('/', OrderDetailsController.addItem);

// Удаление элемента из заказа
orderDetailsRouter.delete('/:id', OrderDetailsController.removeItem);