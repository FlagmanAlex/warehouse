export interface IDeliveryItem {
    _id?: string
    docIds: string[]
    deliveryId: string
    customerId: string
    addressId: string
    summ: number
    entityCount: number
    dTimePlan?: Date
    dTimeFact?: Date
}