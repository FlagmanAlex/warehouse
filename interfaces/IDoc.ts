export interface IDoc {
    _id?: string                                    //ID заказа
    orderNum: string                                //Номер заказа в базе
    docNum: string                                  //Номер заказа поставщика в приходе
    docDate: Date                                   //Дата заказа
    vendorCode: string                              //№ отслеживания прихода
    exchangeRate: number                            //Курс
    bonusRef: number                                //Вознаграждение
    expenses: number                                //Логистика
    // payment: number                                 //Сумма оплаты
    warehouseId: string                             //ID склада
    fromWarehouseId?: string                         //ID склада отправителя
    toWarehouseId?: string                           //ID склада получателя
    userId: string                                  //Создатель
    createdAt: Date                                 //Дата создания
    updatedAt: Date                                 //Дата обновления
    description?: string                            //Описание
    orderId?: string                                 //ID заказа
    docType: DocType                                //Тип заказа
    supplierId: string                              //ID поставщика
    status: DocStatus                         //Статус
    customerId: string                                  //ID покупателя
}


export type DocType =
    | 'Incoming'        // Приходные документы
    | 'Outgoing'        // Расходные документы
    | 'Return'          // Возвратные документы
    | 'Transfer'        // Документы перемещения
    | 'WriteOff'        // Документы списания
export type DocStatusIn =
    //Для прихода
    | 'Draft'           //Не влияет на остатки и финансы
    | 'Shipped'         //Просто статус для отслеживания
    | 'InTransitHub'    //Просто статус для отслеживания
    | 'InTransitDestination' //Просто статус для отслеживания
    | 'Delivered'       //Создает партии, увеличивает остаток в Inventory, создает транзакции
    | 'Completed'       //Статус меняется после создания документа Оплата
    | 'Canceled'        //Инверсия остатка, проведение дополнительных транзакций
export type DocStatusOut =
    //Для расхода
    | 'Draft'           //Не влияет на остатки и финансы
    | 'Reserved'        //Уменьшает свободный остаток и увеличивает резерв
    | 'Shipped'         //Уменьшает остаток в резерве и делает изменения в Transaction, 
    | 'Completed'       //Статус меняется после создания документа Оплата
    | 'Canceled'        //Инверсия остатка, проведение дополнительных транзакций

export type DocStatus = DocStatusIn | DocStatusOut;