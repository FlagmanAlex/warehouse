import { Types } from "mongoose";

export interface IPriceHistory {
    _id?: Types.ObjectId; // Уникальный идентификатор записи
    productId: Types.ObjectId; // Ссылка на товар
    price: number; // Цена товара
    startDate: Date; // Дата начала действия цены
    endDate?: Date; // Дата окончания действия цены (если применимо)
}
