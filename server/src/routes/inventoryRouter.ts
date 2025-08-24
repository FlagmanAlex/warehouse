import express from 'express';
import { InventoryController } from '@controllers';

export const inventoryRouter = express.Router();

// Остатки на складе с партиями с нулевыми
inventoryRouter.get('/warehousebatch/:warehouseId', InventoryController.getInventoryByWarehouseWithBatch);

// Остатки на складе с партиями без нулевых
inventoryRouter.get('/warehousebatchnotnull/:warehouseId', InventoryController.getInventoryByWarehouseWithBatchNotNull);

// Остатки на складе с партиями с нулевыми
inventoryRouter.get('/warehouse/:warehouseId', InventoryController.getInventoryByWarehouse);

// Остатки на складе с партиями без нулевых
inventoryRouter.get('/warehousenotnull/:warehouseId', InventoryController.getInventoryByWarehouseNotNull);

// Остатки товаров на всех складах
inventoryRouter.get('/product/:productId', InventoryController.getInventoryByProduct);

// Ручное обновление остатков (инвентаризация)
inventoryRouter.put('/adjust', InventoryController.updateInventory);