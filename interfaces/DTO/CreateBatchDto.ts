// CreateBatchDto.ts
export interface CreateBatchDto {
  productId: string;
  supplierId: string;
  receiptDate: Date;
  purchasePrice: number;
  expirationDate: Date;
  quantityReceived: number;
  unitOfMeasure: string;
  status: string;
  warehouseId: string;
}