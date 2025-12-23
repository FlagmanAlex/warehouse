import { IAccount } from "@interfaces";
import mongoose, { Schema } from "mongoose";

export interface IAccountModel extends Omit<IAccount, '_id'>, mongoose.Document {}

const accountSchema = new Schema<IAccountModel>({
    _id: { type: Schema.Types.ObjectId, required: true },
    entityType: { type: String, enum: ['customer', 'supplier', 'cash', 'bank'], required: true },
    entityId: { type: String, required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    refType: { type: String, enum: ['order', 'payment', 'expense', 'adjustment'], required: true },
    refId: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const AccountModel = mongoose.model<IAccountModel>('Account', accountSchema, 'Account');