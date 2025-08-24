// SupplierResponseDto.ts
export interface ResponseSupplierDto {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  userId: string;
  userName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}