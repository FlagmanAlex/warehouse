import { DeliveryService } from "@services";
import { Request, Response } from "express";

export class DeliveryController {
    static async getDocDeliveries(req: Request, res: Response) {
        const dateStart: Date = req.query.startDate ? new Date(req.query.startDate.toString()) : new Date();
        const dateEnd: Date = req.query.endDate ? new Date(req.query.endDate.toString()) : new Date()
        try {
            const deliveries = await DeliveryService.getDocDeliveries(dateStart, dateEnd);
            
            res.status(200).json(deliveries);
        } catch (error) {
            console.error('Ошибка при получении списка доставок:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    static async createDelivery(req: Request, res: Response) {
        try {
            const data = req.body;
            
            const delivery = await DeliveryService.createDelivery(data);
            res.status(200).json(delivery);
        } catch (error) {
            console.error('Ошибка при создании доставки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    static async deleteDelivery(req: Request, res: Response) {
        try {
            const { deliveryId } = req.params;
            await DeliveryService.deleteDelivery(deliveryId);
            console.log('Deleted deliveryId', deliveryId);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Ошибка при удалении доставки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    static async getDeliveryForId(req: Request, res: Response) {
        try {
            const { deliveryId } = req.params;
            const delivery = await DeliveryService.getDeliveryForId(deliveryId);
            res.status(200).json(delivery);
        } catch (error) {
            console.error('Ошибка при получении доставки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    static async updateDelivery(req: Request, res: Response) {
        try {
            const { deliveryId } = req.params;
            const data = req.body;
            const delivery = await DeliveryService.updateDelivery(deliveryId, data, req.userId);
            res.status(200).json(delivery);
        } catch (error) {
            console.error('Ошибка при обновлении доставки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
}