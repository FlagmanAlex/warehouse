export interface IOrderDetails {
    _id?: string
    orderId: string
    productId: string
    batchId?: string
    quantity: number
    bonusStock?: number
    unitPrice: number
}