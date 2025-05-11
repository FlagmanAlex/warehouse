import mongoose, { Schema } from "mongoose";
import { ISupplier } from "../interfaces/ISupplier";

interface ISupplierModel extends Omit<ISupplier, '_id'>, mongoose.Document { }

const supplierSchema = new Schema<ISupplierModel>({
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
});

export const SupplierModel = mongoose.model('Supplier', supplierSchema, 'Supplier');