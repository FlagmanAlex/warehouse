// Interfaces/DTO/UpdateProductDto.ts
export interface UpdateProductDto {
  article?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  unitOfMeasurement?: string;
  price?: number;
  supplierId?: string;
  isArchived?: boolean;
}