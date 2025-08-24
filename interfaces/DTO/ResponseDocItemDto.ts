export interface ResponseDocItemDto {
    _id: string            // id
    docId: string           // id документа
    productId: IProduct       // id товара
    batchId: IBatch         // id партии
    quantity: number        // количество
    bonusStock: number     // бонус
    unitPrice: number       // цена
    notes: string          // заметки
}

interface IProduct {
    _id: string;
    name: string;
    price: number;
    // другие поля товара
}

interface IBatch {
    _id: string;
    batchNumber: string;
    // другие поля партии
}