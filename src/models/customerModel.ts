import mongoose, { Schema } from "mongoose";
import { ICustomer } from "../interfaces/ICustomer";

interface ICustomerModel extends Omit<ICustomer, '_id'>, mongoose.Document { }

// Схема для клиентов
const customerSchema = new Schema<ICustomerModel>({
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
});

export const CustomerModel = mongoose.model('Customer', customerSchema, 'Customer');