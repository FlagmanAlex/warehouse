import mongoose, { Schema } from "mongoose";
import { ITransaction } from "@interfaces/ITransaction";

interface ITransactionModel extends Omit<ITransaction, '_id' | 'productId' | 'warehouseId' | 'batchId' | 'userId'>, mongoose.Document { 
    productId: mongoose.Types.ObjectId
    warehouseId: mongoose.Types.ObjectId
    batchId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
 }

// Схема для транзакций
const transactionSchema = new Schema<ITransactionModel>({
    transactionType: { type: String, enum: ['Приход', 'Расход', 'Перемещение', 'Списание'], required: true }, // Тип транзакции
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' }, // Ссылка на заказ (если есть)
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Ссылка на товар
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }, // Ссылка на склад
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true }, // Ссылка на партию
    previousQuantity: { type: Number, required: true }, // Количество товара предыдущее
    changeQuantity: { type: Number, required: true }, // Количество товара новое
    transactionDate: { type: Date, default: Date.now }, // Дата транзакции
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

transactionSchema.index({ productId: 1 }); // История движений товара
transactionSchema.index({ batchId: 1 }); // Все операции с партией
transactionSchema.index({ transactionDate: -1 }); // Свежие транзакции первыми
transactionSchema.index({ userId: 1, transactionDate: -1 }); // Создатель транзакции

export const TransactionModel = mongoose.model<ITransactionModel>('Transaction', transactionSchema, 'Transaction');