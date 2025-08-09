import mongoose, { Schema } from "mongoose";
import { IOrderDetails } from "@interfaces/IOrderDetails";

interface IOrderDetailsModel extends Omit<IOrderDetails, '_id' | 'orderId' | 'productId' | 'batchId'>, mongoose.Document { 
    orderId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    batchId?: mongoose.Types.ObjectId;
 }
// Схема для деталей заказа
const orderDetailsSchema = new Schema<IOrderDetailsModel>({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true }, 
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true },
    bonusStock: { type: Number }
});

export const OrderDetailsModel = mongoose.model<IOrderDetailsModel>('OrderDetail', orderDetailsSchema, 'OrderDetail');