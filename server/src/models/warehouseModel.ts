import mongoose, { Schema } from "mongoose";
import { IWarehouse } from "../../../interfaces/IWarehouse";

interface IWarehouseModel extends Omit<IWarehouse, '_id'>, mongoose.Document { }
// Схема для складов
const warehouseSchema = new Schema<IWarehouseModel>({
    name: { type: String, required: true },
    location: String,
    capacity: Number,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export const WarehouseModel = mongoose.model('Warehouse', warehouseSchema, 'Warehouse');