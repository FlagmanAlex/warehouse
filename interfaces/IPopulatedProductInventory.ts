// Interfaces/IPopulatedProductInventory.ts

export interface IPopulatedProductInventory {
  productId: string;
  productName: string;
  article: string;
  unitOfMeasurement?: string;

  // Все остатки по складам с деталями
  inventoryByWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    quantityAvailable: number;
    batchId?: string;
    batchExpirationDate?: Date;
  }>;

  // Склад по умолчанию
  defaultWarehouseId: string;
  defaultWarehouseName: string;
  defaultWarehouseStock: number;
}