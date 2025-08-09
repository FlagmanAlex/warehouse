import { Types } from "mongoose"

export interface IInventory {
    _id?: string                // _id: - идентификатор таблицы остатков
    productId: string           // productId: - идентификатор продукта
    batchId: string             // batchId: - идентификатор партии
    warehouseId: string         // warehouseId: - идентификатор склада
    quantityAvailable: number   // quantityAvailable: - количество остатков
    lastUpdate: Date            // lastUpdate: - дата последнего обновления
}