import { Types } from "mongoose";

export interface ICategory {
    _id?: Types.ObjectId;
    name: string; // Название категории
    parentCategory?: Types.ObjectId; // Ссылка на родительскую категорию (если есть)
}