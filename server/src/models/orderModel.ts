import mongoose, { Schema } from "mongoose";
import { IOrder } from "../../../interfaces/IOrder";

export interface IOrderModel extends Omit<IOrder, '_id'>, mongoose.Document { }
// Схема для заказов
const orderSchema = new Schema({
    orderNum: { type: String, required: true, unique: true },
    docNum: { type: String },
    orderDate: { type: Date, default: Date.now }, // Дата заказа
    vendorCode: { type: String },
    orderType: { type: String, enum: ['Приход', 'Расход'] },
    exchangeRate: { type: Number },
    bonusRef: { type: Number },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: () => { (this as any).orderType === 'Приход' }
    }, // Ссылка на клиента

    supplierId: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: () => { (this as any).orderType === 'Расход' }
    }, // Ссылка на поставщика
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }, // Ссылка на склад
    status: { type: String, enum: ['Активен', 'В резерве', 'Завершен', 'Отменен'], default: 'Активен' }, // Статус заказа
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

});

orderSchema.index({ orderDate: -1 }); // Сортировка заказов по дате
orderSchema.index({ status: 1 }); // Фильтрация по статусу
orderSchema.index({ customerId: 1, orderDate: -1 }); // История заказов клиента
orderSchema.index({ createdBy: 1, orderDate: -1 }); // Создатель заказа

export const OrderModel = mongoose.model('Order', orderSchema, 'Order');
// export type IOrder = mongoose.InferSchemaType<typeof orderSchema>