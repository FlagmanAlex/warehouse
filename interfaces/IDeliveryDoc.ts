export interface IDeliveryDoc {
    _id?: string;
    date: Date              //Дата доставки
    startTime: Date         //Время начала доставки
    unloadTime?: Date       //Время разгрузки
    timeInProgress?: Date   //Время в процессе доставки
    totalCountEntity: number//Количество сущностей
    totalCountDoc: number   //Количество документов
    totalSum: number        //Итоговая сумма
    creatorId: string
}