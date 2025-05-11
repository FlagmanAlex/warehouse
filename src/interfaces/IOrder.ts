import { Types } from "mongoose"

export interface IOrder {
    _id?: string
    orderType: 'Приход' | 'Расход'
    warehouseId: Types.ObjectId
    supplierId: Types.ObjectId
    customerId: Types.ObjectId
    orderDate: Date
    status: 'В ожидании' | 'Завершен' | 'Отменен'
    userId: Types.ObjectId                          //Создатель
}
