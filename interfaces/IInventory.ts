import { Types } from "mongoose"

export interface IInventory {
    _id?: Types.ObjectId
    productId: Types.ObjectId
    batchId: Types.ObjectId
    warehouseId: Types.ObjectId
    quantityAvailable: number
    lastUpdate: Date
}