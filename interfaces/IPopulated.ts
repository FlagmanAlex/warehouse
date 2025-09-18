// Interfaces/IPopulated.ts

import type { ICustomer } from './ICustomer';
import type { IUser } from './IUser';
import type { IProduct } from './IProduct';
import type { IWarehouse } from './IWarehouse';
import type { IBatch } from './IBatch';

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