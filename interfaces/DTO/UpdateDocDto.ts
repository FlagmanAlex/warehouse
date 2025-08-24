// UpdateDocDto.ts
export interface UpdateDocDto {
  docNum?: string;
  docDate?: Date;
  vendorCode?: string;
  docType?: 'Приход' | 'Расход' | 'Перемещение';
  exchangeRate?: number;
  bonusRef?: number;
  expenses?: number;
  payment?: number;
  warehouseId?: string;
  supplierId?: string;
  customerId?: string;
  status?: 'Активен' | 'В резерве' | 'Завершен' | 'Отменен';
}