import mongoose, { Schema } from "mongoose";
import { IInventory } from "../../../interfaces/IInventory";

interface IInventoryModel extends Omit<IInventory, '_id'>, mongoose.Document { }

const inventorySchema = new Schema<IInventoryModel>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true }, // Исправлено: добавлено обязательное поле
    quantityAvailable: { type: Number, required: true, min: 0 },
    lastUpdate: { type: Date, required: true, default: Date.now }
});

inventorySchema.index({ productId: 1 })
inventorySchema.index({ batchId: 1, warehouseId: 1 }, { unique: true });
inventorySchema.index({ warehouseId: 1 });
inventorySchema.index({ quantityAvailable: 1 });

export const InventoryModel = mongoose.model('Inventory', inventorySchema, 'Inventory');