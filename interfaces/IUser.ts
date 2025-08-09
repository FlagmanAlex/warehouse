import { Types } from "mongoose";

export interface IUser {
    _id?: string
    username: string; // Имя пользователя
    email: string; // Электронная почта
    password: string; // Хэш пароля
    role?: "admin" | "user"; // Роль пользователя (например, admin, user)
    createdAt?: Date; // Дата создания
    updatedAt?: Date; // Дата последнего обновления
}
