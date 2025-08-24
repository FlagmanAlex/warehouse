// CreateWarehouseDto.ts
export interface CreateWarehouseDto {
  name: string;
  location?: string;
  capacity?: number;
  description?: string;
  userId: string;
}