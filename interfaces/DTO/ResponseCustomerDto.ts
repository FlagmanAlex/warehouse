// CustomerResponseDto.ts
export interface ResponseCustomerDto {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gps?: string;
  percent?: number;
  accountManager: string;
  accountManagerName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}