import mongoose, { Schema } from "mongoose";
import { IInventory } from "../interfaces/IInventory";

interface IInventoryModel extends Omit<IInventory, '_id'>, mongoose.Document { }
// Схема для остатков на складах
const inventorySchema = new Schema<IInventoryModel>({
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true }, // Уникальный идентификатор партии
    quantityAvailable: { type: Number, required: true, min: 0 }, // Текущее доступное количество
    lastUpdate: { type: Date, required: true } //Дата последнего обновления
});

inventorySchema.index({ batchId: 1, warehouseId: 1 }, { unique: true }); // Уникальность связки
inventorySchema.index({ warehouseId: 1 }); // Поиск всех партий на складе
inventorySchema.index({ quantityAvailable: 1 }); // Для запросов типа "где мало остатков"

export const InventoryModel = mongoose.model('Inventory', inventorySchema, 'Inventory');