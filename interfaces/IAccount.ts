export interface IAccount {
  _id?: string
  entityType: 
      'customer'    // Клиент
    | 'supplier'    // Поставщик
    | 'cash'        // Касса
    | 'bank'        // Банк

  entityId: string  // customerId, supplierId
  amount: number    // положительное — приход, отрицательное — расход
  balanceAfter: number  // Баланс после операции
  refType: 
    | 'doc'       // Документ
    | 'payment'     // Платеж
    | 'expense'     // Расход
    | 'adjustment'  // Корректировка
    refId: string     // orderId, paymentId и т.д.
  userId: string
  createdAt: Date
}