import mongoose, { Schema } from "mongoose";
import { IDocItem } from "@interfaces";

interface IDocItemsModel extends Omit<IDocItem, '_id' | 'docId' | 'productId' | 'batchId'>, mongoose.Document { 
    docId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    batchId?: mongoose.Types.ObjectId;
 }
// Схема для деталей заказа
const docItemsSchema = new Schema<IDocItemsModel>({
    docId: { type: Schema.Types.ObjectId, ref: 'Doc', required: true }, 
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true },
    bonusStock: { type: Number }
});

export const DocItemsModel = mongoose.model<IDocItemsModel>('DocItems', docItemsSchema, 'DocItems');