import { Types } from "mongoose"

export interface IInventory {
    _id?: string
    batchId: Types.ObjectId
    warehouseId: Types.ObjectId
    quantityAvailable: number
    lastUpdate: Date
}