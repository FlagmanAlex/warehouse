import { Request, Response } from 'express';
import { InventoryModel } from '../models/inventoryModel';
import { TransactionModel } from '../models/transactionModel';
import mongoose, { model } from 'mongoose';
import { BatchModel } from '../models/batchModel';

export class InventoryController {
    // Получение остатков по складу с партиями и нулевыми остатками
    static getInventoryByWarehouseWithBatch = async (req: Request, res: Response) => {
        try {
            const inventory = await InventoryModel.find({ warehouseId: req.params.warehouseId })
                .populate('batchId')
                .populate('warehouseId');
            res.json(inventory);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении остатков' });
        }
    };

    // Получение остатков по складу с партиями (без нулевых)
    static getInventoryByWarehouseWithBatchNotNull = async (req: Request, res: Response) => {
        try {
            const inventory = await InventoryModel.find({
                warehouseId: req.params.warehouseId,
                quantityAvailable: { $gt: 0 } // <-- Исключаем нулевые остатки
            })
                .populate('batchId')
                .populate('warehouseId');

            res.json(inventory);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении остатков' });
        }
    };

    // Получение остатков по складу по товару (все, включая нулевые)
    static getInventoryByWarehouse = async (req: Request, res: Response) => {
        try {
            const inventory = await InventoryModel.find({ warehouseId: req.params.warehouseId })
                .populate('productId') // Опционально, если нужно получить имя продукта
                .populate('warehouseId')
                .populate('batchId')

            res.json(inventory);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении остатков' });
        }
    };

    // Получение остатков по складу по товару (без нулевых)
    static getInventoryByWarehouseNotNull = async (req: Request, res: Response) => {
        try {
            const inventory = await InventoryModel.find({
                warehouseId: req.params.warehouseId,
                quantityAvailable: { $gt: 0 } // Исключаем нулевые остатки
            })
                .populate('productId') // Опционально, если нужно получить имя продукта
                .populate({
                    path: 'productId',
                    populate: {
                        path: 'categoryId',
                        model: 'Category'
                    }
                })
                .populate('warehouseId')
                .populate('batchId')

            res.json(inventory);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении остатков' });
        }
    };



    // Получение остатков товара на всех складах
    static getInventoryByProduct = async (req: Request, res: Response) => {
        try {
            const inventory = await InventoryModel.aggregate([
                { $lookup: { from: 'batches', localField: 'batchId', foreignField: '_id', as: 'batch' } },
                { $unwind: '$batch' },
                { $match: { 'batch.productId': new mongoose.Types.ObjectId(req.params.productId) } },
                { $group: { _id: '$warehouseId', total: { $sum: '$quantityAvailable' } } }
            ]);
            res.json(inventory);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении остатков' });
        }
    };

    // Ручное обновление остатков (например, при инвентаризации)
    static updateInventory = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { batchId, warehouseId, newQuantity } = req.body;


            // Проверка корректности данных newQuantity
            if (typeof newQuantity !== 'number' || newQuantity < 0) {
                throw new Error('Некорректное значение newQuantity');
            }

            // Получаем инвентарь с populate
            const inventory = await InventoryModel.findOne({ batchId, warehouseId })
                .populate('batchId')
                .session(session);

            if (!inventory || !inventory.batchId) {
                throw new Error('Инвентарная запись или партия не найдены');
            }

            const batch = await BatchModel.findById(inventory.batchId).session(session)

            if (!batch) throw new Error('Партия не найдена')

            // Обновление количества и сохранение
            const oldQuantity = inventory.quantityAvailable;
            inventory.quantityAvailable = newQuantity;
            await inventory.save({ session });

            // Создание транзакции с уточнением типов
            await TransactionModel.create([{
                transactionType: 'Корректировка',
                productId: batch.productId,
                warehouseId,
                batchId,
                previousQuantity: oldQuantity,
                quantityChange: newQuantity - oldQuantity,
                userId: req.userId,
                comment: 'Ручное обновление остатков'
            }], { session });

            await session.commitTransaction();
            res.json(inventory);
        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({ error: (error as Error).message });
        } finally {
            session.endSession();
        }
    }
}
