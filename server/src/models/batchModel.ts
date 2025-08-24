import mongoose, { Schema } from "mongoose";
import { IBatch } from '@interfaces';

export interface IBatchModel extends Omit<IBatch, '_id' | 'productId' | 'supplierId' | 'warehouseId'>, mongoose.Document {
    productId: mongoose.Types.ObjectId
    supplierId: mongoose.Types.ObjectId
    warehouseId: mongoose.Types.ObjectId
 }

const batchSchema = new Schema<IBatchModel>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    quantityReceived: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 }, // Добавлено: цена закупки
    expirationDate: { type: Date, required: true },
    receiptDate: { type: Date, required: true, default: () => Date.now() },
    unitOfMeasure: { type: String, required: true, enum: ['шт', 'кг', 'л', 'м'], default: 'шт' }, // Добавлено: единица измерения
    status: { // Добавлено: статус партии
        type: String,
        enum: ['active', 'expired', 'blocked', 'ending_soon'],
        default: 'active'
    },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }
});

batchSchema.index({ productId: 1 });
batchSchema.index({ supplierId: 1 });
batchSchema.index({ expirationDate: 1 });
batchSchema.index({ receiptDate: -1 });
batchSchema.index({ status: 1 }); // Для фильтрации по статусу

export const BatchModel = mongoose.model<IBatchModel>('Batch', batchSchema, 'Batch');