import mongoose, { Schema } from "mongoose";
import { ICategory } from "../interfaces/ICategory";

interface ICategoryModel extends Omit<ICategory, '_id'>, mongoose.Document { }

const categorySchema = new Schema<ICategoryModel>({
    name: { type: String, required: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' }, // Родительская категория
});

export const CategoryModel = mongoose.model('Category', categorySchema, 'Category');