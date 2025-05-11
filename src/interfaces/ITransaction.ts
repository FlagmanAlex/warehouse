import { Types } from "mongoose";

export interface ITransaction {
    _id?: string;
    transactionType: 'Приход' | 'Расход' | 'Перемещение' | 'Списание'; // Тип транзакции
    productId: Types.ObjectId; // Ссылка на товар
    warehouseId: Types.ObjectId; // Ссылка на склад
    batchId: Types.ObjectId; // Ссылка на партию
    quantity: number; // Количество товара
    transactionDate?: Date; // Дата транзакции
    orderId?: Types.ObjectId; // Ссылка на заказ (если есть)
    userId: Types.ObjectId // Кто выполнил операцию
}