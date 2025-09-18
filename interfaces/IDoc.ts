


/** ******************************
 * Тип документа
 * ******************************/
export type DocType =
    | 'Order'           // Заказ
    | 'Incoming'        // Приходные документы
    | 'Outgoing'        // Расходные документы
    | 'Transfer'        // Документы перемещения
// | 'Return'          // Возвратные документы
// | 'WriteOff'        // Документы списания

/** ******************************
 * Статусы документов для прихода
 * ******************************/
export type DocStatusIn =
    //Для прихода
    | 'Draft'           //Не влияет на остатки и финансы
    | 'Shipped'         //Просто статус для отслеживания
    | 'InTransitHub'    //Просто статус для отслеживания
    | 'InTransitDestination' //Просто статус для отслеживания
    | 'Delivered'       //Создает партии, увеличивает остаток в Inventory, создает транзакции
    | 'Completed'       //Статус меняется после создания документа Оплата
    | 'Canceled'        //Инверсия остатка, проведение дополнительных транзакций

/** ******************************
 * Статусы документов для расхода
 ******************************/
export type DocStatusOut =
    //Для расхода
    | 'Draft'           //Не влияет на остатки и финансы
    | 'Reserved'        //Уменьшает свободный остаток и увеличивает резерв
    | 'Shipped'         //Уменьшает остаток в резерве и делает изменения в Transaction, 
    | 'Completed'       //Статус меняется после создания документа Оплата
    | 'Canceled'        //Инверсия остатка, проведение дополнительных транзакций

/** ******************************
 * Приоритет заказа
 ******************************/
export type PriorityOrder =
    | 'Low'         // Низкий приоритет
    | 'Medium'      // Средний приоритет
    | 'High';       // Высокий приоритет

export type DocStatus = DocStatusIn | DocStatusOut;

export interface IDocBase {
    /** ID заказа */
    _id?: string                                    
    /** Входящий номер документа в бумажном носителе */
    orderNum: string                                
    /** Внутренний Номер документа в базе */
    docNum: string                                  
    /** Дата заказа */
    docDate: Date   
    /** Вознаграждение */
    bonusRef: number
    /** Сумма заказа */                                
    summ: number
    /** ID склада */
    warehouseId: string                             
    /** Создатель */
    userId: string                                  
    /** Дата создания */
    createdAt: Date                                 
    /** Дата обновления */
    updatedAt: Date                                 
    /** Описание */
    description?: string                            
    /** ID заказа */
    docId?: string                                 
    /** Тип заказа */
    docType: DocType                               
    /** Статус */
    status: DocStatus                         
}

export interface IDocTransfer extends IDocBase {
    docType: 'Transfer'
    fromWarehouseId: string
    toWarehouseId: string
}

export interface IDocIncoming extends IDocBase {
    docType: 'Incoming'
    vendorCode: string                              //№ отслеживания курьерской службы
    supplierId: string
    /** Курс */
    exchangeRate: number                            
    /** Логистика */
    expenses: number                                
}

export interface IDocOutgoing extends IDocBase {
    docType: 'Outgoing'
    customerId: string
}
export interface IDocOrder extends IDocBase {
    docType: 'Order'
    customerId: string
    priority: PriorityOrder
    expenses: number
}

export type IDoc = IDocIncoming | IDocOutgoing | IDocOrder | IDocTransfer;
