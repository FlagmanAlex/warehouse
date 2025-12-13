import mongoose, { Schema } from "mongoose";
import { ICategory } from "@interfaces";

interface ICategoryModel extends Omit<ICategory, '_id' | 'parentCategory'>, mongoose.Document {
    parentCategory?: mongoose.Types.ObjectId
 }

const categorySchema = new Schema<ICategoryModel>({
    name: { type: String, required: true },
    logo: { type: String, required: false },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' }, // Родительская категория

});

categorySchema.index({ name: 1 }, { unique: true }) // Уникальность названий

export const CategoryModel = mongoose.model<ICategoryModel>('Category', categorySchema, 'Category');