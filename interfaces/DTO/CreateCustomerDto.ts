// CreateCustomerDto.ts
export interface CreateCustomerDto {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gps?: string;
  percent?: number;
  accountManager: string;
}