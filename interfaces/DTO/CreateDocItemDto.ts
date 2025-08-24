// Interfaces/DTO/CreateDocItemDto.ts
export interface CreateDocItemDto {
  productId: string;        // Идентификатор товара
  quantity: number;         // Количество
  bonusStock?: number;      
  unitPrice: number;
}

