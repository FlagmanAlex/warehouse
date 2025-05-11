import { Types } from "mongoose";

export interface IOrderDetails {
    _id?: string
    orderId: Types.ObjectId
    productId: Types.ObjectId
    batchId: Types.ObjectId
    quantity: number
    unitPrice: number
}