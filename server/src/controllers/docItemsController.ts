import { Request, Response } from 'express';
import { 
    DocItemsModel,
    InventoryModel,
    TransactionModel,
    BatchModel,
    DocModel,
    
} from '../models';
import { IDoc, IDocItem } from '@interfaces';


export class DocItemsController {
    // Добавить позицию
    static async addItem(req: Request, res: Response) {
        try {

            const requestDocItem: IDocItem = req.body;

            // Проверка существования заказа
            const doc: IDoc | null = await DocModel.findById(requestDocItem.docId);
            if (!doc) throw new Error('Заказ не найден');

            // Для расходных заказов проверяем остатки
            if (doc.docType === 'Outgoing') {
                const inventory = await InventoryModel.findOne({
                    batchId: requestDocItem.batchId,
                    warehouseId: doc.warehouseId
                });

                if (!inventory || inventory.quantityAvailable < requestDocItem.quantity) {
                    throw new Error('Недостаточно товара на складе');
                }
            }

            // Добавляем позицию в таблицу заказов (orderDetails)
            const docItem = await DocItemsModel.create({
                docId: requestDocItem.docId,
                productId: requestDocItem.productId,
                batchId: requestDocItem.batchId,
                quantity: requestDocItem.quantity,
                unitPrice: requestDocItem.unitPrice
            });

            // Получаем текущее количество на складе
            const previousQuantity = await this.getCurrentInventory(requestDocItem.batchId!, doc.warehouseId!);

            // Обновляем остатки
            const quantityChange = requestDocItem.quantity 
            const inventoryUpdateResult = await InventoryModel.updateOne(
                { batchId: requestDocItem.batchId, warehouseId: doc.warehouseId },
                { $inc: { quantityAvailable: quantityChange } },
                { upsert: true }
            );

            if (inventoryUpdateResult.modifiedCount === 0 && inventoryUpdateResult.upsertedCount === 0) {
                // Если обновление не удалось, откатываем создание позиции
                await DocItemsModel.deleteOne({ _id: docItem._id });
                throw new Error('Не удалось обновить остатки на складе');
            }

            // Логируем транзакцию
            const transaction = await TransactionModel.create({
                transactionType:  'Incoming',
                productId: requestDocItem.productId,
                batchId: requestDocItem.batchId,
                warehouseId: doc.warehouseId,
                quantityChange,
                previousQuantity,
                userId: req.userId,
                docId: requestDocItem.docId
            });

            if (!transaction) {
                // Если создание транзакции не удалось, откатываем обновление остатков и создание позиции
                await InventoryModel.updateOne(
                    { batchId: requestDocItem.batchId, warehouseId: doc.warehouseId },
                    { $inc: { quantityAvailable: -quantityChange } }
                );
                await DocItemsModel.deleteOne({ _id: docItem._id });
                throw new Error('Не удалось создать транзакцию');
            }

            res.status(201).json(docItem);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    // Удалить позицию
    static async removeItem(req: Request, res: Response) {
        try {
            const docItemId = req.params.id;
            const item: IDocItem | null = await DocItemsModel.findById(docItemId);
            if (!item) throw new Error('Позиция не найдена');

            const doc: IDoc | null = await DocModel.findById(item.docId);
            if (!doc) throw new Error('Заказ не найден');

            if (doc.status !== 'Canceled') {
                const quantityChange = doc.docType === 'Incoming'
                    ? -item.quantity
                    : item.quantity;

                const previousQuantity = await this.getCurrentInventory(item.batchId!, doc.warehouseId!);

                // Обновляем остатки
                const inventoryUpdateResult = await InventoryModel.updateOne(
                    { batchId: item.batchId, warehouseId: doc.warehouseId },
                    { $inc: { quantityAvailable: quantityChange } }
                );

                if (inventoryUpdateResult.modifiedCount === 0) {
                    throw new Error('Не удалось обновить остатки на складе');
                }

                // Логируем транзакцию
                const transaction = await TransactionModel.create({
                    transactionType: 'Корректировка',
                    productId: item.productId,
                    batchId: item.batchId,
                    warehouseId: doc.warehouseId,
                    quantityChange: -quantityChange,
                    previousQuantity,
                    userId: req.userId,
                    docId: item.docId,
                    comment: 'Отмена позиции заказа',
                });

                if (!transaction) {
                    // Если создание транзакции не удалось, откатываем обновление остатков
                    await InventoryModel.updateOne(
                        { batchId: item.batchId, warehouseId: doc.warehouseId },
                        { $inc: { quantityAvailable: -quantityChange } }
                    );
                    throw new Error('Не удалось создать транзакцию');
                }
            }

            // Удаляем позицию из заказа
            const deleteResult = await DocItemsModel.deleteOne({ _id: req.params.id });

            if (deleteResult.deletedCount === 0) {
                throw new Error('Не удалось удалить позицию из заказа');
            }

            // Проверяем, осталась ли партия в заказе
            const remainingDetails = await DocItemsModel.find({ batchId: item.batchId });
            if (remainingDetails.length === 0) {
                // Если партия больше не используется, удаляем её из Batch
                const batchDeleteResult = await BatchModel.deleteOne({ _id: item.batchId });

                if (batchDeleteResult.deletedCount === 0) {
                    throw new Error('Не удалось удалить партию из Batch');
                }
            }

            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    private static async getCurrentInventory(batchId: string | null, warehouseId: string): Promise<number> {
        const inventory = await InventoryModel.findOne({ batchId, warehouseId });
        return inventory?.quantityAvailable || 0;
    }
}