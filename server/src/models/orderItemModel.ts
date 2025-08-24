import { IOrderItem } from "@interfaces";
import mongoose, { Schema } from "mongoose";


export interface IOrderItemModel extends Omit<IOrderItem, '_id' | 'orderId' | 'productId'>, mongoose.Document {
    orderId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
}

const OrderItemSchema = new Schema<IOrderItemModel>({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    requestedQuantity: { type: Number, required: true },
    fulfilledQuantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    preferredWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }
});

export const OrderItemModel = mongoose.model<IOrderItemModel>('OrderItem', OrderItemSchema, 'OrderItem');