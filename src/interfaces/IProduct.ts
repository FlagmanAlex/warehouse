import { Document, Types } from "mongoose"

export interface IProduct {
    _id?: string
    name: string                //Наименование
    description?: string        //Описание продукции
    category: Types.ObjectId    //Id категории
    unitOfMeasurement?: string  //Единицы измерения
    price: number               //Цена
    isArchived: boolean         //Рахивация позиции в справочнике (вместо удаления)
    createdBy: Types.ObjectId      //Создатель
    lastUpdateBy: Types.ObjectId      //Обновил
}