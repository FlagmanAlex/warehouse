import mongoose, { Schema } from "mongoose";
import { IAddress, IDoc } from "@interfaces";

export interface IDocModel extends Omit<IDoc,
    | '_id'
    | 'userId'
    | 'warehouseId'
    | 'customerId'
    | 'supplierId'
    | 'fromWarehouseId'
    | 'toWarehouseId'
>, mongoose.Document {
    userId: mongoose.Types.ObjectId,
    warehouseId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    supplierId: mongoose.Types.ObjectId,
    fromWarehouseId: mongoose.Types.ObjectId,
    toWarehouseId: mongoose.Types.ObjectId,
    vendorCode?: string
    exchangeRate?: number,
    expenses?: number,
    addressId?: IAddress
}
// Схема для заказов
const docSchema = new Schema<IDocModel>({
    docNum: { type: String, required: true, unique: true },
    orderNum: { type: String },
    docDate: { type: Date, default: () => Date.now() },
    vendorCode: { type: String },
    docType: { type: String, required: true },
    bonusRef: { type: Number },
    expenses: { type: Number },
    exchangeRate: { type: Number },
    summ: { type: Number, required: true },
    itemCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // payment: { type: Number },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: () => { return (this as any).docType === 'Incoming' } }, // Ссылка на клиента
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: () => { return (this as any).docType === 'Outgoing' } }, // Ссылка на поставщика
    
    toWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: () => { return (this as any).docType === 'Transfer' } },
    fromWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: () => { return (this as any).docType === 'Transfer' } },
    
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: function (this: any) { return this.docType !== 'OrderOut' } }, //Если docType не равен 'OrderOut', то поле обязательно
    priority: { type: String },
    docStatus: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    docId: { type: Schema.Types.ObjectId, ref: 'Doc', required: false },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: false },
    
});

docSchema.index({ docDate: -1 }); // Сортировка заказов по дате
docSchema.index({ status: 1 }); // Фильтрация по статусу
docSchema.index({ customerId: 1, docDate: -1 }); // История заказов клиента
docSchema.index({ userId: 1, docDate: -1 }); // Создатель заказа

export const DocModel = mongoose.model<IDocModel>('Doc', docSchema, 'Doc');