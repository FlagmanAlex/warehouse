// WarehouseResponseDto.ts
export interface ResponseWarehouseDto {
  _id: string;
  name: string;
  location?: string;
  capacity?: number;
  description?: string;
  userId: string;
  managerName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}