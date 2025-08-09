
export interface IBatch {   
    _id?: string                    //ID
    productId: string               //Таблица Product
    supplierId: string              //Таблица Supplier
    receiptDate: Date               //Дата поступления
    purchasePrice: number           //Цена закупки
    expirationDate: Date            //Дата истечения срока годности
    quantityReceived: number        //Количество поступившее
    unitOfMeasure: string           //Единица измерения
    status: string                  //Статус
    warehouseId: string             //Таблица Warehouse
}
