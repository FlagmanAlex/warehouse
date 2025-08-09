import { Types } from "mongoose";

export interface ITransaction {
    _id?: string;
    transactionType: 'Приход' | 'Расход' | 'Перемещение' | 'Списание'; // Тип транзакции
    productId: string; // Ссылка на товар
    warehouseId: string; // Ссылка на склад
    batchId: string; // Ссылка на партию
    previousQuantity: number; // Количество товара было
    changeQuantity: number; // Количество товара стало
    transactionDate?: Date; // Дата транзакции
    orderId?: string; // Ссылка на заказ (если есть)
    userId: string // Кто выполнил операцию
}