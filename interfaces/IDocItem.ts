export interface IDocItem {
    _id?: string            // id
    docId: string           // id документа
    productId: string       // id товара
    batchId?: string        // id партии
    quantity: number        // количество
    bonusStock?: number     // бонус
    unitPrice: number       // цена
    notes?: string          // заметки
    createdAt?: Date        // дата создания
    updatedAt?: Date        // дата обновления
    description?: string    // описание
}

