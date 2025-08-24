// Interfaces/IPopulatedOrderItem.ts

import { IPopulatedProduct, IPopulatedWarehouse } from './IPopulated';

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