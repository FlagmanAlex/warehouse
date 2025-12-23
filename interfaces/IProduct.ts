import { ProductType } from './Config'
interface IBaseProduct {
    _id?: string
    article: string
    name: string                //Наименование
    description?: string        //Описание продукции
    categoryId: string          //Id категории
    unitOfMeasurement?: ProductUnit;    //Единицы измерения
    price: number               //Цена
    minStock?: number            //Минимальный запас
    isArchived: boolean         //Архивация позиции в справочнике (вместо удаления)
    createdBy?: string           //Создатель
    lastUpdateBy?: string        //Обновил
    supplierId?: string          //Поставщик
    createdAt?: Date             //Дата создания
    updatedAt?: Date             //Дата последнего обновления
    defaultWarehouseId?: string  //Id склада по умолчанию
    image?: string[]             //Изображения
    packagingId?: string         //Упаковка
    productType: ProductType     //Тип продукта
}





export interface IParfum extends IBaseProduct {
    // Идентификаторы
    fullArticle: string; // Полный артикул товара (например, m00350) [2]
    smallArticle: string; // Короткий артикул (например, m003) [2]
    
    // Специфические текстовые характеристики
    originFor: string; // Оригинальный аромат, для поклонников которого создан продукт (например, 'Giorgio Armani Acqua di Gio') [2]
    parfumesFor: 'духи для мужчин' | 'духи для женщин' | 'унисекс'; // Категория парфюма [2, 4, 7, 8]
    smell: string; // Направление аромата (например, 'ЦИТРУСОВЫЕ ВОДНЫЕ') [3]
    status: 'В наличии' | 'present: false' | string; // Статус наличия товара [3, 9]
    
    // Ноты аромата (используются компонентом Card для отдельного вывода) [6]
    topNotes: string; // Верхние ноты [2]
    heartNotes: string; // Ноты сердца [2]
    baseNotes: string; // Базовые ноты [2]
    
    // Специфические ссылки на изображения (используются компонентом Card) [5, 6]
    imageLogo: string; // Имя файла логотипа (например, 'EssenceLogo.png') [2]
    imageBottle: string; // Имя файла изображения флакона (например, 'BottleMan01') [2]
}

export interface IVitamin extends IBaseProduct {
    brand?: string;
    nameRUS?: string;
    nameENG?: string;
    nameShort?: string;
    dose?: string;
}


export type IProduct = IParfum | IVitamin;
export type ProductUnit = 'шт' | 'кг' | 'мл' | 'л' | 'г';