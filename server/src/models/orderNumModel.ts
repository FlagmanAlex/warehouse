import mongoose, { Schema } from "mongoose";
import { IOrderNum } from "@interfaces/IOrderNum";

interface IOrderNumModel extends IOrderNum, mongoose.Document {
    _id: string
 }

const orderNumSchema = new Schema<IOrderNumModel>({
    _id: { type: String, required: true },
    nextNumber: { type: Number, default: 1 }
})

export const OrderNumModel = mongoose.model<IOrderNumModel>('OrderNum', orderNumSchema, 'OrderNum')