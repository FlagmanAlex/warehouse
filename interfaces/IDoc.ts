import type { DocTypeName, DocStatusName } from './Config';

/******************************
 * Приоритет заказа
 ******************************/
export type PriorityOrder =
    | 'Low'         // Низкий приоритет
    | 'Medium'      // Средний приоритет
    | 'High';       // Высокий приоритет


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
    /** Тип документа */
    docType: DocTypeName
    /** Статус */
    docStatus: DocStatusName
}

export interface IDocTransfer extends IDocBase {
    // docType: 'Transfer'
    fromWarehouseId: string
    toWarehouseId: string
}

export interface IDocIncoming extends IDocBase {
    // docType: 'Incoming'
    vendorCode: string                              //№ отслеживания курьерской службы
    supplierId: string
    /** Курс */
    exchangeRate: number
    /** Логистика */
    expenses: number
}

export interface IDocOutgoing extends IDocBase {
    // docType: 'Outgoing'
    customerId: string
}
export interface IDocOrder extends IDocBase {
    // docType: 'Order'
    customerId: string
    priority: PriorityOrder
    expenses: number
}

export type IDoc = IDocIncoming | IDocOutgoing | IDocOrder | IDocTransfer;
