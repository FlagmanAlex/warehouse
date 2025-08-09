import { Types } from "mongoose";

export interface ICustomer {
    _id?: string;               // _id - клиента
    name: string;               // Имя
    contactPerson?: string;     // Контактное лицо
    phone?: string;             // Телефон
    email?: string;             // Электронная почта
    address?: string;           // Адрес
    gps?: string                // GPS
    percent?: Number            // Процент
    accountManager: string;     // userId
}