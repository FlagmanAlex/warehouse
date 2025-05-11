import mongoose, { Document, Schema } from "mongoose";
import { IBatch } from "../interfaces/IBatch";

interface IBatchModel extends Omit<IBatch, '_id'>, Document { }
// Схема для партий
const batchSchema = new Schema<IBatchModel>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true }, // Ссылка на товар
    // Ссылка на поставщика
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' }, 
    receiptDate: { type: Date, required: true, default: Date.now }, // Дата поступления партии
    expirationDate: { type: Date, required: true, index: true }, // Дата истечения срока годности
    quantityReceived: { type: Number, required: true, min: 0 }, // Количество товара в партии при поступлении
});

batchSchema.index({ productId: 1 }); // Частый поиск партий по товару
batchSchema.index({ supplierId: 1 }); // Поиск по поставщику
batchSchema.index({ expirationDate: 1 }); // Для поиска просроченных партий
batchSchema.index({ receiptDate: -1 }); // Сортировка по дате поступления (новые сначала)

export const BatchModel = mongoose.model('Batch', batchSchema, 'Batch');