// Interfaces/IPopulated.ts

import type { ICustomer } from './ICustomer.js';
import type { IUser } from './IUser.js';
import type { IProduct } from './IProduct.js';
import type { IWarehouse } from './IWarehouse.js';
import type { IBatch } from './IBatch.js';

// Популированные версии

export interface IPopulatedCustomer extends Omit<ICustomer, '_id'> {
  _id: string;
}

export interface IPopulatedUser extends Omit<IUser, '_id'> {
  _id: string;
}

export interface IPopulatedProduct extends Omit<IProduct, '_id' | 'categoryId' | 'supplierId'> {
  _id: string;
  categoryId: string; // можно оставить как ссылку, или раскрыть
  supplierId: string;
}

export interface IPopulatedWarehouse extends Omit<IWarehouse, '_id'> {
  _id: string;
}

export interface IPopulatedBatch extends Omit<IBatch, '_id' | 'productId' | 'supplierId' | 'warehouseId'> {
  _id: string;
  productId: string;
  supplierId: string;
  warehouseId: string;
}