export interface IPayment {
  _id?: string;               // Уникальный идентификатор платежа
  docId: string;            // Идентификатор документа, к которому относится платеж
  amount: number;          // Сумма платежа
  date: Date;               // Дата платежа
  status: PaymentStatus;    // Статус платежа
  method: PaymentMethod;    // Метод платежа
  createdAt: Date;          // Дата создания платежа
}

export type PaymentStatus = 
  | 'Pending' 
  | 'Completed' 
  | 'Failed';
export type PaymentMethod = 
  | 'Card' 
  | 'SBP' 
  | 'Bank' 
  | 'Online';