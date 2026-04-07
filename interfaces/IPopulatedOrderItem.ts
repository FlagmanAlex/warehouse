// Interfaces/IPopulatedOrderItem.ts

import type { IPopulatedProduct } from './IPopulated.js';

export interface IPopulatedOrderItem {
  _id?: string;
  orderId: string;
  productId: IPopulatedProduct;
  requestedQuantity: number;
  fulfilledQuantity: number;
  unitPrice: number;
  preferredWarehouseId?: string;
  notes?: string;
}