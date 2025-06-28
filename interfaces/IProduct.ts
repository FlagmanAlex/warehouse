import { Types } from "mongoose"

export interface IProduct {
    _id?: Types.ObjectId
    article: string
    name: string                //Наименование
    description?: string        //Описание продукции
    categoryId: Types.ObjectId  //Id категории
    unitOfMeasurement?: string  //Единицы измерения
    price: number               //Цена
    isArchived: boolean         //Рахивация позиции в справочнике (вместо удаления)
    createdBy: Types.ObjectId      //Создатель
    lastUpdateBy: Types.ObjectId      //Обновил
    supplierId: Types.ObjectId
}