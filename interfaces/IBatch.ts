import type { ProductUnit } from "./IProduct"

export interface IBatch {   
    _id?: string                    //ID
    productId: string               //Таблица Product
    supplierId: string              //Таблица Supplier
    receiptDate: Date               //Дата поступления
    purchasePrice: number           //Цена закупки
    expirationDate: Date            //Дата истечения срока годности
    quantityReceived: number        //Количество поступившее
    unitOfMeasure: ProductUnit           //Единица измерения
    status: StatusBatch             //Статус
    warehouseId: string             //Таблица Warehouse
}


export type StatusBatch = 'active' | 'expired' | 'blocked' | 'ending_soon';