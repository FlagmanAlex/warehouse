import mongoose, { Schema } from "mongoose";
import { IPriceHistory } from "@interfaces";

interface IPriceHistoryModel extends Omit<IPriceHistory, '_id' | 'productId'>, mongoose.Document { 
    productId: mongoose.Types.ObjectId
 }

const priceHistorySchema = new Schema<IPriceHistoryModel>({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, // Ссылка на товар
    price: { type: Number, required: true }, // Цена товара
    startDate: { type: Date, required: true }, // Дата начала действия цены
    endDate: { type: Date } // Дата окончания действия цены (если применимо)
});

export const PriceHistoryModel = mongoose.model<IPriceHistoryModel>("PriceHistory", priceHistorySchema, "PriceHistory");
