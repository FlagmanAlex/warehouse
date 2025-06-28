import mongoose, { Schema } from "mongoose";
import { IOrderNum } from "../../../interfaces/IOrderNum";

const orderNumSchema = new Schema<IOrderNum>({
    _id: { type: String, required: true },
    nextNumber: { type: Number, default: 1 }
})

export const OrderNumModel = mongoose.model<IOrderNum>('OrderNum', orderNumSchema, 'OrderNum')