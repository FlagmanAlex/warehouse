export interface INotification {
  _id?: string
  userId: string
  type: 'expiry' | 'low_stock' | 'order_ready' | 'payment_due'
  message: string
  isRead: boolean
  refId?: string  // orderId, batchId
  createdAt: Date
}