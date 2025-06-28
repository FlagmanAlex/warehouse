import { Types } from "mongoose";

export interface ITransaction {
    _id?: Types.ObjectId;
    transactionType: 'Приход' | 'Расход' | 'Перемещение' | 'Списание'; // Тип транзакции
    productId: Types.ObjectId; // Ссылка на товар
    warehouseId: Types.ObjectId; // Ссылка на склад
    batchId: Types.ObjectId; // Ссылка на партию
    previousQuantity: number; // Количество товара было
    changeQuantity: number; // Количество товара стало
    transactionDate?: Date; // Дата транзакции
    orderId?: Types.ObjectId; // Ссылка на заказ (если есть)
    userId: Types.ObjectId // Кто выполнил операцию
}