import mongoose, { Schema } from "mongoose";
import { IOrderDetails } from "../../../interfaces/IOrderDetails";

export interface IOrderDetailsModel extends Omit<IOrderDetails, '_id'>, mongoose.Document { }
// Схема для деталей заказа
const orderDetailsSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true }, // Ссылка на заказ
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Ссылка на товар
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true }, // Ссылка на партию
    quantity: { type: Number, required: true, min: 0 }, // Количество товара
    unitPrice: { type: Number, required: true }, // Цена за единицу товара
    bonusStock: { type: Number }
});

export const OrderDetailsModel = mongoose.model('OrderDetail', orderDetailsSchema, 'OrderDetail');