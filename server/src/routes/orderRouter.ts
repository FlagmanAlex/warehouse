import express from 'express';
import { OrderController } from '../controllers/orderController';

export const orderRouter = express.Router();

// Получение списка заказов
orderRouter.get('/', OrderController.getAllOrders);
// Получение заказа по ID
orderRouter.get('/:id', OrderController.getOrderById);

// Создание нового заказа
orderRouter.post('/', OrderController.createOrder);