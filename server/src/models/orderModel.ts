import mongoose, { Schema } from "mongoose";
import { IOrder } from '@interfaces'


export interface IOrderModel extends Omit<IOrder, '_id' | 'customerId' | 'userId' | 'items'>, mongoose.Document {
    customerId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    items: Schema.Types.ObjectId[];
}

const OrderSchema = new mongoose.Schema<IOrderModel>({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, default: 0 },
  totalQuantity: { type: Number, default: 0 },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }]
});

export const OrderModel = mongoose.model<IOrderModel>('Order', OrderSchema, 'Order');