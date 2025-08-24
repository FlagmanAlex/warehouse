// Interfaces/DTO/CreateDocDto.ts
import { DocStatus, DocType } from '../IDoc';
import { CreateDocItemDto } from './CreateDocItemDto';

export interface CreateDocDto {
  docDate: string | Date;
  orderNum?: string;
  vendorCode?: string;
  docType: DocType
  exchangeRate?: number;
  bonusRef?: number;
  expenses?: number;
  payment?: number;
  supplierId?: string;
  customerId?: string;
  warehouseId: string;
  fromWarehouseId?: string; // только для Перемещения
  toWarehouseId?: string;   // только для Перемещения
  status?: DocStatus;
  items: CreateDocItemDto[];
}