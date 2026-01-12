import mongoose, { Schema } from "mongoose";
import { IUser } from "@warehouse/interfaces";

interface IUserModel extends Omit<IUser, '_id'>, mongoose.Document { }

const userSchema = new Schema<IUserModel>({
    username: { type: String, required: true }, // Имя пользователя
    email: { type: String, required: true, unique: true }, // Электронная почта
    password: { type: String, required: true }, // Хэш пароля
    role: { type: String, required: true, enum: ["admin", "user"] }, // Роль пользователя
    createdAt: { type: Date, default: Date.now }, // Дата создания
    updatedAt: { type: Date, default: Date.now } // Дата последнего обновления
});

export const UserModel = mongoose.model<IUserModel>("User", userSchema, "User");
