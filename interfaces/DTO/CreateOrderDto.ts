// Interfaces/DTO/CreateOrderDto.ts

import { CreateOrderItemDto } from "./CreateOrderItemDto";

export interface CreateOrderDto {
    customerId: string;
    orderDate?: string | Date;
    userId: string;
    items: CreateOrderItemDto[];
    deliveryDate?: string | Date;
    priority?: 'Низкий' | 'Средний' | 'Высокий';
}