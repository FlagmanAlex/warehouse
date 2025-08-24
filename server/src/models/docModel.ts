import mongoose, { Schema } from "mongoose";
import { IDoc } from "@interfaces";

export interface IDocModel extends Omit<IDoc, '_id' | 'userId' | 'warehouseId' | 'customerId' | 'supplierId'>, mongoose.Document {
    userId: mongoose.Types.ObjectId,
    warehouseId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    supplierId: mongoose.Types.ObjectId
 }
// Схема для заказов
const docSchema = new Schema<IDocModel>({
    docNum: { type: String, required: true, unique: true },
    orderNum: { type: String },
    docDate: { type: Date, default: () =>  Date.now() },
    vendorCode: { type: String },
    docType: { type: String, required: true },
    exchangeRate: { type: Number },
    bonusRef: { type: Number },
    expenses: { type: Number },
    // payment: { type: Number },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: () => { return (this as any).docType === 'Incoming' }
    }, // Ссылка на клиента

    supplierId: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: () => { return (this as any).docType === 'Outgoing' }
    }, // Ссылка на поставщика
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }, 

    status: { type: String, default: 'Draft',   }, 
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

});

docSchema.index({ docDate: -1 }); // Сортировка заказов по дате
docSchema.index({ status: 1 }); // Фильтрация по статусу
docSchema.index({ customerId: 1, docDate: -1 }); // История заказов клиента
docSchema.index({ userId: 1, docDate: -1 }); // Создатель заказа

export const DocModel = mongoose.model<IDocModel>('Doc', docSchema, 'Doc');