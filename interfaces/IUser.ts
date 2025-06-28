import { Types } from "mongoose";

export interface IUser {
    _id?: Types.ObjectId
    username: string; // Имя пользователя
    email: string; // Электронная почта
    password: string; // Хэш пароля
    role?: string; // Роль пользователя (например, admin, user)
    createdAt?: Date; // Дата создания
    updatedAt?: Date; // Дата последнего обновления
}
