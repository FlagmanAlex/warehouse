import mongoose, { Schema, Types } from "mongoose";
import { ICategory } from "../../../interfaces/ICategory";

interface ICategoryModel extends Omit<ICategory, '_id'>, mongoose.Document { }

const categorySchema = new Schema<ICategoryModel>({
    name: { type: String, required: true },
    parentCategory: { type: Types.ObjectId, ref: 'Category' }, // Родительская категория
});

categorySchema.index({ name: 1 }, { unique: true });

export const CategoryModel = mongoose.model('Category', categorySchema, 'Category');