
export interface ICustomer {
    _id?: string;               // _id - клиента
    name: string;               // Имя
    phone?: string;             // Телефон
    contactPerson?: string;     // Контактное лицо
    contactPersonPhone?: string; // Телефон контактного лица
    email?: string;             // Электронная почта
    address?: string;           // Адрес
    gps?: string                // GPS
    percent?: number            // Процент
    accountManager: string;     // userId
    createdAt?: Date            // Дата создания
    updatedAt?: Date            // Дата обновления
    description?: string        // Описание
}