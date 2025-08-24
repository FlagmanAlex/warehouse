import { ProductUnit } from './IProduct'

export interface IPackaging {
    id?: string;                             // Уникальный идентификатор упаковки
    productId: string;                      // Идентификатор продукта
    unit: ProductUnit;                       // Единица измерения
    quantityPerPack: number;                 // Количество в упаковке
    isDefault: boolean;                       // Является ли упаковка по умолчанию
    barcode: string;                          // Штрих-код упаковки
}
