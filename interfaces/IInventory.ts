export interface IInventory {
    _id?: string                // _id: - идентификатор таблицы остатков
    productId: string           // productId: - идентификатор продукта
    batchId: string             // batchId: - идентификатор партии
    warehouseId: string         // warehouseId: - идентификатор склада
    // locationId: string          // locationId: - идентификатор местоположения
    quantityAvailable: number   // quantityAvailable: - количество свободных остатков
    quantityReserved: number    // quantityReserved: - количество зарезервированных остатков
    lastUpdate: Date            // lastUpdate: - дата последнего обновления
}