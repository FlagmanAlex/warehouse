export interface IUser {
    _id?: string
    username: string; // Имя пользователя
    email: string; // Электронная почта
    password: string; // Хэш пароля
    role?: UserRole; // Роль пользователя (например, admin, user)
    createdAt?: Date; // Дата создания
    updatedAt?: Date; // Дата последнего обновления
}


export type UserRole = "owner" | "admin" | "user" | "manager" | "guest";