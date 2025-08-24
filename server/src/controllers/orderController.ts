// controllers/OrderController.ts

import { Request, Response } from 'express';
import { CreateOrderDto } from '@interfaces/DTO';
import { OrderService } from '@services';

export class OrderController {
  /**
   * Создание заказа
   */
  static async createOrder(req: Request<{}, {}, CreateOrderDto>, res: Response) {
    try {
      const order = await OrderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Получение всех заказов
   */
  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await OrderService.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Получение заказа по ID
   */
  static async getOrderById(req: Request, res: Response) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      const items = await OrderService.getOrderItems(req.params.id);
      res.json({ order, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Обновление статуса заказа
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Получение остатков товара для UI
   */
  static async getProductInventory(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const data = await OrderService.getProductInventory(productId);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Формирование документов списания (Расход) по заказу
   */
  static async createFulfillmentDocs(req: Request, res: Response) {
    try {
      await OrderService.createFulfillmentDocs(req.params.id);
      res.json({ success: true, message: 'Документы списания созданы' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}