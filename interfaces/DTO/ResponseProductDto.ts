// Interfaces/DTO/ProductResponseDto.ts
export interface ResponseProductDto {
  _id: string;
  article: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;           // Можно добавить на сервере
  unitOfMeasurement?: string;
  price: number;
  supplierId: string;
  supplierName?: string;           // Доп. поле
  isArchived: boolean;
  createdBy: string;
  lastUpdateBy: string;
  createdAt: Date;
  updatedAt: Date;
}