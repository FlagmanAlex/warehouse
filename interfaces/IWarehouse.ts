
export interface IWarehouse {
    _id?: string;
    name: string;               // Название склада
    location?: string;          // Адрес
    capacity?: number;          // Вместимость (в м³ или усл. единицах)
    description?: string
    userId: string;   // Ответственный менеджер (ссылка на User)
}