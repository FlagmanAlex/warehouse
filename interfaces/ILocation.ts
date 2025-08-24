export interface ILocation {
    id?: string;                             // Уникальный идентификатор местоположения
    warehouseId?: string;                    // Идентификатор склада (если есть)
    name: string;                           // Название местоположения
    type?: LocationType;                     // Тип местоположения
    parentId?: string;                      // Идентификатор родительского местоположения (если есть)
    maxCapacity?: number;                   // Максимальная вместимость
}

export type LocationType = 'WAREHOUSE' | 'STORE' | 'DISTRIBUTION_CENTER';
