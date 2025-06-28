import { Types } from "mongoose";

export interface IWarehouse {
    _id?: Types.ObjectId;
    name: string;               // Название склада
    location?: string;          // Адрес
    capacity?: number;          // Вместимость (в м³ или усл. единицах)
    description?: string
    userId: Types.ObjectId;   // Ответственный менеджер (ссылка на User)
}