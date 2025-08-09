
export interface ISupplier {
    _id?: string
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    userId: string; // Добавлено поле userId
}