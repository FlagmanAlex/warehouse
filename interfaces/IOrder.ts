// Interfaces/IOrder.ts

import { IOrderItem } from "./IOrderItem";

export interface IOrder {
    _id?: string;               // Идентификатор заказа

    customerId: string;         // Идентификатор клиента
    orderNum: string;           // Номер заказа
    orderDate: Date;            // Дата заказа
    totalAmount: number;        // Общая сумма заказа
    totalQuantity: number;      // Общее количество товара
    userId: string;             // Идентификатор пользователя
    deliveryDate?: Date;        // Дата доставки
    priority?: 'Низкий' | 'Средний' | 'Высокий';    // Приоритет заказа
    description?: string;       // Описание заказа
    items: IOrderItem[];        // Список товаров в заказе
}