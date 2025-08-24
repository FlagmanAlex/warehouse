import mongoose, { Schema } from "mongoose";
import { ISupplier } from "@interfaces";

interface ISupplierModel  extends Omit<ISupplier, '_id' | 'userId'>, mongoose.Document {
    userId: mongoose.Types.ObjectId
 }

// Схема для поставщиков
const supplierSchema = new Schema<ISupplierModel>({
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    // userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Добавлено поле userId
});

export const SupplierModel = mongoose.model<ISupplierModel>('Supplier', supplierSchema, 'Supplier');