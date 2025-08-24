import mongoose, { Schema } from "mongoose";
import { IWarehouse } from "@interfaces";

interface IWarehouseModel extends Omit<IWarehouse, '_id' | 'userId'>, mongoose.Document {
    userId: Schema.Types.ObjectId
 }
// Схема для складов
const warehouseSchema = new Schema<IWarehouseModel>({
    name: { type: String, required: true },
    location: String,
    capacity: Number,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export const WarehouseModel = mongoose.model<IWarehouseModel>('Warehouse', warehouseSchema, 'Warehouse');