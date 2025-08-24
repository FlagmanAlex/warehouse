// Interfaces/DTO/OrderItemResponseDto.ts

export interface ResponseOrderItemDto {
    _id: string;
    productId: string;
    productName: string;
    article: string;
    unitOfMeasurement?: string;
    requestedQuantity: number;
    fulfilledQuantity: number;
    unitPrice: number;
    totalPrice: number;
    preferredWarehouseId?: string;
    preferredWarehouseName?: string;
}