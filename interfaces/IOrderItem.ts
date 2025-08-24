// Interfaces/IOrderItem.ts

export interface IOrderItem {
    _id?: string;                   //Идентификатор элемента заказа
    orderId: string;                //Идентификатор заказа
    productId: string;              //Идентификатор товара

    // Что хочет клиент
    requestedQuantity: number;      //Запрашиваемое количество
    unitPrice: number;              //Цена за единицу

    // Что уже выделено/отгружено
    fulfilledQuantity: number;      //Выданное количество

    // Опционально: приоритетный склад (может отличаться от defaultWarehouseId)
    preferredWarehouseId?: string;  //Идентификатор склада

    // Дополнительно: можно добавить комментарий, резерв и т.д.
    notes?: string;                 //Дополнительные заметки
}