import mongoose, { Schema } from "mongoose";
import { ICustomer } from "@interfaces";

interface ICustomerModel extends Omit<ICustomer, '_id'| 'accountManager'>, mongoose.Document {
    accountManager: mongoose.Types.ObjectId
 }

// Схема для клиентов
const customerSchema = new Schema<ICustomerModel>({
    name: { type: String, required: true },
    phone: String,
    contactPerson: String,
    contactPersonPhone: String,
    email: String,
    address: String,
    gps: String,
    percent: Number,
    accountManager: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Добавлено поле userId
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    description: String
});

export const CustomerModel = mongoose.model<ICustomerModel>('Customer', customerSchema, 'Customer');