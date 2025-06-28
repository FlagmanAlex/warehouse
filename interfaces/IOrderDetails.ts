import { Types } from "mongoose";

export interface IOrderDetails {
    _id?: Types.ObjectId
    orderId: Types.ObjectId
    productId: Types.ObjectId
    batchId: Types.ObjectId
    quantity: number
    bonusStock?: number
    unitPrice: number
}