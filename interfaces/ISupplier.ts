import { Types } from "mongoose";

export interface ISupplier {
    _id?: Types.ObjectId;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    userId: Types.ObjectId; // Добавлено поле userId
}