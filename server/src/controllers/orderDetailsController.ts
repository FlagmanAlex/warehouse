import { Request, Response } from 'express';
import { OrderDetailsModel } from '../models/orderDetailsModel';
import { InventoryModel } from '../models/inventoryModel';
import { TransactionModel } from '../models/transactionModel';
import { OrderModel } from '../models/orderModel';
import { BatchModel } from '../models/batchModel';
import { IOrderDetails } from '@interfaces/IOrderDetails';
import { IOrder } from '@interfaces/IOrder';

export class OrderDetailsController {
    // Добавить позицию
    static async addItem(req: Request, res: Response) {
        try {

            const requestOrderDetails: IOrderDetails = req.body;

            // Проверка существования заказа
            const order: IOrder | null = await OrderModel.findById(requestOrderDetails.orderId);
            if (!order) throw new Error('Заказ не найден');

            // Для расходных заказов проверяем остатки
            if (order.orderType === 'Расход') {
                const inventory = await InventoryModel.findOne({
                    batchId: requestOrderDetails.batchId,
                    warehouseId: order.warehouseId
                });

                if (!inventory || inventory.quantityAvailable < requestOrderDetails.quantity) {
                    throw new Error('Недостаточно товара на складе');
                }
            }

            // Добавляем позицию в таблицу заказов (orderDetails)
            const detail = await OrderDetailsModel.create({
                orderId: requestOrderDetails.orderId,
                productId: requestOrderDetails.productId,
                batchId: requestOrderDetails.batchId,
                quantity: requestOrderDetails.quantity,
                unitPrice: requestOrderDetails.unitPrice
            });

            // Получаем текущее количество на складе
            const previousQuantity = await this.getCurrentInventory(requestOrderDetails.batchId, order.warehouseId);

            // Обновляем остатки
            const quantityChange = order.orderType === 'Приход' ?
                requestOrderDetails.quantity :
                -requestOrderDetails.quantity;
            const inventoryUpdateResult = await InventoryModel.updateOne(
                { batchId: requestOrderDetails.batchId, warehouseId: order.warehouseId },
                { $inc: { quantityAvailable: quantityChange } },
                { upsert: true }
            );

            if (inventoryUpdateResult.modifiedCount === 0 && inventoryUpdateResult.upsertedCount === 0) {
                // Если обновление не удалось, откатываем создание позиции
                await OrderDetailsModel.deleteOne({ _id: detail._id });
                throw new Error('Не удалось обновить остатки на складе');
            }

            // Логируем транзакцию
            const transaction = await TransactionModel.create({
                transactionType: order.orderType === 'Приход' ? 'Приход' : 'Расход',
                productId: requestOrderDetails.productId,
                batchId: requestOrderDetails.batchId,
                warehouseId: order.warehouseId,
                quantityChange,
                previousQuantity,
                userId: req.userId,
                orderId: requestOrderDetails.orderId
            });

            if (!transaction) {
                // Если создание транзакции не удалось, откатываем обновление остатков и создание позиции
                await InventoryModel.updateOne(
                    { batchId: requestOrderDetails.batchId, warehouseId: order.warehouseId },
                    { $inc: { quantityAvailable: -quantityChange } }
                );
                await OrderDetailsModel.deleteOne({ _id: detail._id });
                throw new Error('Не удалось создать транзакцию');
            }

            res.status(201).json(detail);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    // Удалить позицию
    static async removeItem(req: Request, res: Response) {
        try {
            const orderDetailsId = req.params.id;
            const detail: IOrderDetails | null = await OrderDetailsModel.findById(orderDetailsId);
            if (!detail) throw new Error('Позиция не найдена');

            const order: IOrder | null = await OrderModel.findById(detail.orderId);
            if (!order) throw new Error('Заказ не найден');

            if (order.status !== 'Завершен') {
                const quantityChange = order.orderType === 'Приход'
                    ? -detail.quantity
                    : detail.quantity;

                const previousQuantity = await this.getCurrentInventory(detail.batchId, order.warehouseId);

                // Обновляем остатки
                const inventoryUpdateResult = await InventoryModel.updateOne(
                    { batchId: detail.batchId, warehouseId: order.warehouseId },
                    { $inc: { quantityAvailable: quantityChange } }
                );

                if (inventoryUpdateResult.modifiedCount === 0) {
                    throw new Error('Не удалось обновить остатки на складе');
                }

                // Логируем транзакцию
                const transaction = await TransactionModel.create({
                    transactionType: 'Корректировка',
                    productId: detail.productId,
                    batchId: detail.batchId,
                    warehouseId: order.warehouseId,
                    quantityChange: -quantityChange,
                    previousQuantity,
                    userId: req.userId,
                    orderId: detail.orderId,
                    comment: 'Отмена позиции заказа',
                });

                if (!transaction) {
                    // Если создание транзакции не удалось, откатываем обновление остатков
                    await InventoryModel.updateOne(
                        { batchId: detail.batchId, warehouseId: order.warehouseId },
                        { $inc: { quantityAvailable: -quantityChange } }
                    );
                    throw new Error('Не удалось создать транзакцию');
                }
            }

            // Удаляем позицию из OrderDetails
            const deleteResult = await OrderDetailsModel.deleteOne({ _id: req.params.id });

            if (deleteResult.deletedCount === 0) {
                throw new Error('Не удалось удалить позицию из заказа');
            }

            // Проверяем, осталась ли партия в OrderDetails
            const remainingDetails = await OrderDetailsModel.find({ batchId: detail.batchId });
            if (remainingDetails.length === 0) {
                // Если партия больше не используется, удаляем её из Batch
                const batchDeleteResult = await BatchModel.deleteOne({ _id: detail.batchId });

                if (batchDeleteResult.deletedCount === 0) {
                    throw new Error('Не удалось удалить партию из Batch');
                }
            }

            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    private static async getCurrentInventory(batchId: string, warehouseId: string): Promise<number> {
        const inventory = await InventoryModel.findOne({ batchId, warehouseId });
        return inventory?.quantityAvailable || 0;
    }
}