import { Request, Response } from 'express';
import { TransactionModel } from '../models/transactionModel';
import mongoose from 'mongoose';
import { BatchModel } from '../models/batchModel';
import { InventoryModel } from '../models/inventoryModel';


// Создание транзакции (приход/расход)
export class TransactionController {
    static createTransaction = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { transactionType, productId, warehouseId, batchId, changeQuantity } = req.body;

            // Проверка наличия партии и склада
            const [batch, inventory] = await Promise.all([
                BatchModel.findById(batchId).session(session),
                InventoryModel.findOne({ batchId, warehouseId }).session(session)
            ]);

            if (!batch) throw new Error('Партия не найдена');
            if (transactionType === 'Outgoing' && (!inventory || inventory.quantityAvailable < changeQuantity)) {
                throw new Error('Недостаточно товара на складе');
            }

            // Обновляем остатки
            const updatedInventory = await InventoryModel.findOneAndUpdate(
                { batchId, warehouseId },
                { $inc: { quantityAvailable: changeQuantity } },
                { new: true, upsert: true, session }
            );

            // Создаем транзакцию
            const transaction = await TransactionModel.create([{
                transactionType,
                productId,
                warehouseId,
                batchId,
                previousQuantity: updatedInventory.quantityAvailable - changeQuantity,
                changeQuantity,
                userId: req.userId
            }], { session });

            await session.commitTransaction();
            res.status(201).json(transaction[0]);
        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({ error: (error as Error).message });
        } finally {
            session.endSession();
        }
    };

    // История движений по товару
    static getTransactionsByProduct = async (req: Request, res: Response) => {
        try {
            const transactions = await TransactionModel.find({ productId: req.params.id })
                .sort({ transactionDate: -1 })
                .populate({
                    path: 'productId',
                    select: '_id name article' // <-- Выбираем нужные поля
                })
                .populate('batchId')
                .populate('warehouseId')
                .populate('orderId', 'orderDate orderNum')

            // Добавляем вычисляемое поле newQuantity
            const formattedTransactions = transactions.map(transaction => ({
                ...transaction.toObject(),
                newQuantity: transaction.previousQuantity + transaction.changedQuantity,
                productInfo: transaction.productId || null,
                transactionType: transaction.transactionType === 'Incoming' ? 'in' : 'out',
                // orderDate: transaction.orderId?.orderDate || null // <-- Получаем дату документа заказа

            }));

            res.json(formattedTransactions);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении транзакций' });
        }
    };
}
