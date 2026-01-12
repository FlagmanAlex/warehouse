import { IPayment } from "@warehouse/interfaces";
import mongoose, { mongo, Schema } from "mongoose";

export interface IPaymentModel extends Omit<IPayment, '_id' | 'docId'>, mongoose.Document {
    _id: mongoose.Types.ObjectId
    docId: mongoose.Types.ObjectId
 }

const paymentSchema = new Schema<IPaymentModel>({
    docId: { type: Schema.Types.ObjectId, ref: 'Doc', required: true },
    date: { type: Date, default: () => new Date() },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Card', 'SBP', 'Bank', 'Online'], required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

export const PaymentModel = mongoose.model<IPaymentModel>('Payment', paymentSchema, 'Payment');
