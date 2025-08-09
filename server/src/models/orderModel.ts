import mongoose, { Schema } from "mongoose";
import { IOrder } from "@interfaces/IOrder";

interface IOrderModel extends Omit<IOrder, '_id' | 'userId' | 'warehouseId' | 'customerId' | 'supplierId'>, mongoose.Document {
    userId: mongoose.Types.ObjectId,
    warehouseId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    supplierId: mongoose.Types.ObjectId
 }
// Схема для заказов
const orderSchema = new Schema<IOrderModel>({
    orderNum: { type: String, required: true, unique: true },
    docNum: { type: String },
    orderDate: { type: Date, default: () =>  Date.now() },
    vendorCode: { type: String },
    orderType: { type: String, enum: ['Приход', 'Расход'] },
    exchangeRate: { type: Number },
    bonusRef: { type: Number },
    expenses: { type: Number },
    payment: { type: Number },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: () => { return (this as any).orderType === 'Приход' }
    }, // Ссылка на клиента

    supplierId: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: () => { return (this as any).orderType === 'Расход' }
    }, // Ссылка на поставщика
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }, 
    status: { type: String, enum: ['Активен', 'В резерве', 'Завершен', 'Отменен'], default: 'Активен' }, 
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

});

orderSchema.index({ orderDate: -1 }); // Сортировка заказов по дате
orderSchema.index({ status: 1 }); // Фильтрация по статусу
orderSchema.index({ customerId: 1, orderDate: -1 }); // История заказов клиента
orderSchema.index({ userId: 1, orderDate: -1 }); // Создатель заказа

export const OrderModel = mongoose.model<IOrderModel>('Order', orderSchema, 'Order');