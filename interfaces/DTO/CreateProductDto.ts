// Interfaces/DTO/CreateProductDto.ts
export interface CreateProductDto {
  article: string;
  name: string;
  description?: string;
  categoryId: string;
  unitOfMeasurement?: string;
  price: number;
  supplierId: string;
  createdBy: string;
  lastUpdateBy: string;
  isArchived: boolean;
  defaultWarehouseId: string
}