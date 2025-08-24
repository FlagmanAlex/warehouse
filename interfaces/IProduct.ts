export interface IProduct {
    _id?: string
    article: string
    name: string                //Наименование
    description?: string        //Описание продукции
    categoryId: string          //Id категории
    unitOfMeasurement?: ProductUnit;    //Единицы измерения
    price: number               //Цена
    minStock: number            //Минимальный запас
    isArchived: boolean         //Рахивация позиции в справочнике (вместо удаления)
    createdBy: string           //Создатель
    lastUpdateBy: string        //Обновил
    supplierId: string          //Поставщик
    createdAt: Date             //Дата создания
    updatedAt: Date             //Дата последнего обновления
    defaultWarehouseId: string  //Id склада по умолчанию
}

export type ProductUnit = 'шт' | 'кг' | 'мл' | 'л' | 'г';