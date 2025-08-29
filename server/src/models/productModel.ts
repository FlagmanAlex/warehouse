import mongoose, { Schema } from "mongoose";
import { IProduct } from "@interfaces";

export interface IProductModel extends Omit
    <IProduct,
        | "_id"
        | "supplierId"
        | "createdBy"
        | "lastUpdateBy"
        | "categoryId"
        | "defaultWarehouseId"
    >, mongoose.Document {
    categoryId: mongoose.Types.ObjectId
    supplierId: mongoose.Types.ObjectId
    createdBy: mongoose.Types.ObjectId
    lastUpdateBy: mongoose.Types.ObjectId
    defaultWarehouseId: mongoose.Types.ObjectId
}

const productSchema = new Schema<IProductModel>({
    name: { type: String, required: true },
    article: { type: String, required: true, unique: true },
    description: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' }, // Ссылка на категорию
    unitOfMeasurement: { type: String, default: 'шт.' },
    price: { type: Number, required: true, min: 0 },
    isArchived: { type: Boolean, default: false }, // Поле для архивации
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', immutable: true },
    lastUpdateBy: { type: Schema.Types.ObjectId, ref: 'User' },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    createdAt: { type: Date, default: () => Date.now() },
    updatedAt: { type: Date, default: () => Date.now() },
    defaultWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    minStock: { type: Number, default: 0 },
    image: [{ type: String }],
    packagingId: { type: Schema.Types.ObjectId, ref: 'Packaging' }

});

productSchema.index({ name: 'text' }); // Полнотекстовый поиск по названию
productSchema.index({ category: 1 }); // Фильтрация по категории
productSchema.index({ isArchived: 1 }); // Отдельно архивные/неархивные

export const ProductModel = mongoose.model<IProductModel>('Product', productSchema, 'Product');