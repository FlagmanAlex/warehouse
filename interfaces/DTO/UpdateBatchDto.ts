// UpdateBatchDto.ts
export interface UpdateBatchDto {
  receiptDate?: Date;
  purchasePrice?: number;
  expirationDate?: Date;
  quantityReceived?: number;
  unitOfMeasure?: string;
  status?: string;
  warehouseId?: string;
}