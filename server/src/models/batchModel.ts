import mongoose, { Document, Schema } from "mongoose";
import { IBatch } from '../../../interfaces/IBatch'

interface IBatchModel extends Omit<IBatch, '_id'>, Document { }

const batchSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    quantityReceived: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 }, // Добавлено: цена закупки
    expirationDate: { type: Date, required: true },
    receiptDate: { type: Date, required: true, default: Date.now },
    unitOfMeasure: { type: String, required: true, enum: ['шт', 'кг', 'л', 'м'], default: 'шт' }, // Добавлено: единица измерения
    status: { // Добавлено: статус партии
        type: String,
        enum: ['активный', 'срок', 'блок', 'заканчивается'],
        default: 'активный'
    },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }
});

batchSchema.index({ productId: 1 });
batchSchema.index({ supplierId: 1 });
batchSchema.index({ expirationDate: 1 });
batchSchema.index({ receiptDate: -1 });
batchSchema.index({ status: 1 }); // Для фильтрации по статусу

export const BatchModel = mongoose.model('Batch', batchSchema, 'Batch');