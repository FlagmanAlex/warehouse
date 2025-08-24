// Interfaces/DTO/CreateOrderItemDto.ts

export interface CreateOrderItemDto {
    productId: string;
    requestedQuantity: number;
    unitPrice: number;
    preferredWarehouseId?: string;  // переопределение defaultWarehouse
}