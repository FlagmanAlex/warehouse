// Interfaces/IPopulatedOrder.ts

import type { IPopulatedCustomer, IPopulatedUser } from './IPopulated';

export interface IPopulatedOrder {
  _id: string;
  orderNum: string;
  orderDate: Date;
  customerId: IPopulatedCustomer;
  userId: IPopulatedUser;
  status: 'Новый' | 'Формируется' | 'Частично собран' | 'Собран' | 'Отгружен' | 'Отменён';
  totalAmount: number;
  totalQuantity: number;
  deliveryDate?: Date;
  priority?: 'Низкий' | 'Средний' | 'Высокий';
}