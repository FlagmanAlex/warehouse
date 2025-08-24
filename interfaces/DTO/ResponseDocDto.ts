// DocResponseDto.ts
import { ResponseDocItemDto } from '@interfaces/DTO'
import { DocStatus, DocType } from '../IDoc';
export interface ResponseDocDto {
  _id: string;
  orderNum: string;
  docNum: string;
  docDate: Date;
  vendorCode?: string;
  docType: DocType
  exchangeRate: number;
  bonusRef: number;
  expenses: number;
  payment: number;
  warehouseId: IWarehouse;
  supplierId?: ISupplier;
  customerId?: ICustomer;
  status: DocStatus
  userId: IUser;
  createdAt: Date;
  updatedAt: Date;
}

interface IWarehouse {
  _id: string;
  name: string;
}

interface ISupplier {
  _id: string;
  name: string;
}

interface ICustomer {
  _id: string;
  name: string;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}