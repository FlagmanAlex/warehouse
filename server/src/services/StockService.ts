import { IDocItem, IInventory } from "@warehouse/interfaces";
import { InventoryModel } from "@models";


// Сервис управления запасами
export class StockService {

    /**
     * === Резервирование товаров ===
     */
    async reserveItems(items: IDocItem[], warehouseId: string): Promise<void> {
        for (const item of items) {
            const available = await this.getAvailableInventory(item.productId, warehouseId);
            const reserved = await this.getReservedInventory(item.productId, warehouseId);
            const free = available - reserved;

            if (free < item.quantity) {
                throw new Error(`Недостаточно товара для резервирования: ${item.productId}. Доступно: ${free}, требуется: ${item.quantity}`);
            }

            const result = await InventoryModel.updateOne({ productId: item.productId, warehouseId }, { $inc: { quantityReserved: item.quantity, quantityAvailable: -item.quantity } });
        }
        
    }

    /**
     * === Получение доступного остатка ===
     */
    private async getAvailableInventory(productId: string, warehouseId: string): Promise<number> {
        // Логика получения доступного остатка
        const inventory: IInventory | null = await InventoryModel.findOne({ productId, warehouseId });
        return inventory ? inventory.quantityAvailable : 0;
    }

    /**
     * === Получение зарезервированного остатка ===
     */
    private async getReservedInventory(productId: string, warehouseId: string): Promise<number> {
        // Логика получения зарезервированного остатка
        const inventory: IInventory | null = await InventoryModel.findOne({ productId, warehouseId });
        return inventory ? inventory.quantityReserved : 0;
    }
}
