import { Types } from "mongoose"

export interface IProduct {
    _id?: string
    article: string
    name: string                //Наименование
    description?: string        //Описание продукции
    categoryId: string          //Id категории
    unitOfMeasurement?: "шт"    //Единицы измерения
    price: number               //Цена
    isArchived: boolean         //Рахивация позиции в справочнике (вместо удаления)
    createdBy: string           //Создатель
    lastUpdateBy: string        //Обновил
    supplierId: string
}