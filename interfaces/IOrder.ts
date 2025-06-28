import { Types } from "mongoose"
/**
 * @interface интерфейс IOrder
 */
export interface IOrder {
    _id?: Types.ObjectId
    orderNum: string
    docNum: string
    orderDate: Date
    vendorCode: string
    orderType: 'Приход' | 'Расход'
    exchangeRate: number
    bonusRef: number
    warehouseId: Types.ObjectId
    supplierId: Types.ObjectId
    customerId: Types.ObjectId
    status: 'Активен' | 'В резерве' | 'Завершен' | 'Отменен'
    userId: Types.ObjectId                          //Создатель
}
