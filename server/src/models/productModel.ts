import mongoose, { Schema } from "mongoose";
import { IParfum, IProduct, IVitamin } from "@warehouse/interfaces";

interface IProductModel
    extends Omit<
            IProduct,
            | "_id"
            | "supplierId"
            | "createdBy"
            | "lastUpdateBy"
            | "categoryId"
            | "defaultWarehouseId"
        >,
        mongoose.Document {
    categoryId: mongoose.Types.ObjectId;
    supplierId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    lastUpdateBy: mongoose.Types.ObjectId;
    defaultWarehouseId: mongoose.Types.ObjectId;
}

const productSchema = new Schema<IProductModel>(
    {
        name: { type: String, required: true },
        article: { type: String, required: true, unique: true },
        description: { type: String },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category" }, // Ссылка на категорию
        unitOfMeasurement: { type: String, default: "шт." },
        price: { type: Number, required: true, min: 0 },
        isArchived: { type: Boolean, default: false }, // Поле для архивации
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            immutable: true,
        },
        lastUpdateBy: { type: Schema.Types.ObjectId, ref: "User" },
        supplierId: {
            type: Schema.Types.ObjectId,
            ref: "Supplier",
            required: false,
        },
        createdAt: { type: Date, default: () => Date.now() },
        updatedAt: { type: Date, default: () => Date.now() },
        defaultWarehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse",
            required: false,
        },
        minStock: { type: Number, default: 0 },
        image: [{ type: String }],
        packagingId: { type: Schema.Types.ObjectId, ref: "Packaging" },

        productType: { type: String, required: true },
    },
    {
        discriminatorKey: "productType",
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.index({ name: "text" }); // Полнотекстовый поиск по названию
productSchema.index({ category: 1 }); // Фильтрация по категории
productSchema.index({ isArchived: 1 }); // Отдельно архивные/неархивные

export const ProductModel = mongoose.model<IProductModel>(
    "Product",
    productSchema,
    "Product"
);

const parfumSchema = new Schema<IParfum>({
    // === Специфические поля для IParfumProduct ===

    // Идентификаторы
    fullArticle: { type: String, required: false }, // Полный артикул (используется для ссылки на изображение m00350.jpg) [1], [2]
    smallArticle: { type: String, required: false }, // Малый артикул (например, m003) [1]

    // Характеристики аромата
    originFor: { type: String, required: false }, // Исходный аромат, для поклонников которого создан продукт [1]
    parfumesFor: { type: String, required: false }, // Категория парфюма ('духи для мужчин'/'духи для женщин') [1]
    smell: { type: String, required: false }, // Направление аромата ('ЦИТРУСОВЫЕ ВОДНЫЕ') [3]

    // Детализация нот
    topNotes: { type: String, required: false }, // Верхние ноты [1]
    heartNotes: { type: String, required: false }, // Ноты сердца [1]
    baseNotes: { type: String, required: false }, // Базовые ноты [1]

    // Ссылки на специфические изображения
    imageLogo: { type: String, required: false }, // Логотип (например, EssenceLogo.png) [1]
    imageBottle: { type: String, required: false }, // Изображение флакона (например, BottleMan01) [1]

    // Статус
    status: { type: String, required: false }, // Статус наличия ('В наличии') [3]
});

export const ParfumModel = ProductModel.discriminator<IParfum>(
    "Parfum",
    parfumSchema,
    "Parfum"
);

const vitaminSchema = new Schema<IVitamin>({
    // === Специфические поля для IVitaminProduct ===
    dose: { type: String, required: false },
    brand: { type: String, required: false },
    nameENG: { type: String, required: false },
    nameRUS: { type: String, required: false },
    nameShort: { type: String, required: false },
});

export const VitaminModel = ProductModel.discriminator<IVitamin>(
    "Vitamin",
    vitaminSchema,
    "Vitamin"
);
