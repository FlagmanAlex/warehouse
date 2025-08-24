// Interfaces/IPopulatedInventory.ts

import { IBatch } from './IBatch';
import { IWarehouse } from './IWarehouse';
import { IProduct } from './IProduct';

export interface IPopulatedBatch extends Omit<IBatch, '_id' | 'productId' | 'supplierId' | 'warehouseId'> {
  _id: string;
  productId: string;
  supplierId: string;
  warehouseId: string;
}

export interface IPopulatedWarehouse extends Omit<IWarehouse, '_id'> {
  _id: string;
}

export interface IPopulatedInventory {
  _id: string;
  productId: string;
  batchId: IPopulatedBatch;
  warehouseId: IPopulatedWarehouse;
  quantityAvailable: number;
  lastUpdate: Date;
}