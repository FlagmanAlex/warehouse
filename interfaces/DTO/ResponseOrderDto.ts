// Interfaces/DTO/OrderResponseDto.ts

import { ResponseOrderItemDto } from "./ResponseOrderItemDto";

export interface ResponseOrderDto {
    _id: string;
    orderNum: string;
    orderDate: Date;
    customerId: string;
    customerName: string;
    totalAmount: number;
    totalQuantity: number;
    status: 'Новый' | 'Формируется' | 'Частично собран' | 'Собран' | 'Отгружен' | 'Отменён';
    userId: string;
    userName: string;
    items: ResponseOrderItemDto[];
    createdAt: Date;
    updatedAt: Date;
}