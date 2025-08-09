import { Types } from "mongoose"
/**
 * @interface интерфейс IOrder
 */
export interface IOrder {
    _id?: string                                    //ID заказа
    orderNum: string                                //Номер заказа
    docNum: string                                  //Номер документа
    orderDate: Date                                 //Дата заказа
    vendorCode: string                              //Код поставщика
    orderType: 'Приход' | 'Расход' | 'Перемещение'  //Тип заказа
    exchangeRate: number                            //Курс
    bonusRef: number
    expenses: number
    payment: number
    warehouseId: string
    supplierId: string
    customerId: string
    status: 'Активен' | 'В резерве' | 'Завершен' | 'Отменен'
    userId: string                                  //Создатель
}
