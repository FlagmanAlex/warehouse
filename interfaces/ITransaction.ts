import { DocType } from "./IDoc";

export interface ITransaction {
    _id?: string;
    transactionType: DocType
    productId: string; // Ссылка на товар
    warehouseId: string; // Ссылка на склад
    batchId: string; // Ссылка на партию
    previousQuantity: number; // Количество товара было
    changedQuantity: number; // Количество товара стало
    transactionDate?: Date; // Дата транзакции
    docId: string; // Ссылка на заказ (если есть)
    userId: string // Кто выполнил операцию
}

