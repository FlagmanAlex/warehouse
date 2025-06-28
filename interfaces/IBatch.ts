import { Types } from "mongoose"

export interface IBatch {
    _id?: Types.ObjectId
    productId: Types.ObjectId
    supplierId: Types.ObjectId
    receiptDate: Date
    purchasePrice: number
    expirationDate: Date
    quantityReceived: number
    unitOfMeasure: string
    status: string
    warehouseId: Types.ObjectId
}
