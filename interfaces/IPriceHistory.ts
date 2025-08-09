import { Types } from "mongoose";

export interface IPriceHistory {
    _id?: string; // Уникальный идентификатор записи
    productId: string; // Ссылка на товар
    price: number; // Цена товара
    startDate: Date; // Дата начала действия цены
    endDate?: Date; // Дата окончания действия цены (если применимо)
}
