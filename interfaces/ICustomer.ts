import { Types } from "mongoose";

export interface ICustomer {
    _id?: Types.ObjectId;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    gps?: string
    percent?: Number
    accountManager: Types.ObjectId; // Добавлено поле userId
}