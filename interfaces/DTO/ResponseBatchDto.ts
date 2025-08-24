// BatchResponseDto.ts
export interface ResponseBatchDto {
  _id: string;
  productId: string;
  productName?: string;
  supplierId: string;
  supplierName?: string;
  receiptDate: Date;
  purchasePrice: number;
  expirationDate: Date;
  quantityReceived: number;
  unitOfMeasure: string;
  status: string;
  warehouseId: string;
  warehouseName?: string;
  createdAt: Date;
  updatedAt: Date;
}