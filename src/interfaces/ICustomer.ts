import { Types } from "mongoose";

export interface ICustomer {
    _id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    accountManager: Types.ObjectId; // Добавлено поле userId
}