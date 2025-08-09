import mongoose, { Schema } from "mongoose";
import { ICustomer } from "@interfaces/ICustomer";

interface ICustomerModel extends Omit<ICustomer, '_id'| 'accountManager'>, mongoose.Document {
    accountManager: mongoose.Types.ObjectId
 }

// Схема для клиентов
const customerSchema = new Schema<ICustomerModel>({
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    gps: String,
    percent: Number,
    accountManager: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Добавлено поле userId
});

export const CustomerModel = mongoose.model<ICustomerModel>('Customer', customerSchema, 'Customer');