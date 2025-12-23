import { IBatch } from "../../../interfaces";
import { IInventoryModel, InventoryModel } from "../models";

export class InventoryService {
    /********************************************
     * Создать запись инвентаризации
     * @param batchId - идентификатор партии
     * @param warehouseId - идентификатор склада
     * @param quantity - количество
     ********************************************/
    static async create(batchId: string, warehouseId: string, quantity: number) {
        const inventory: IInventoryModel = new InventoryModel({ batchId, warehouseId, quantityAvailable: quantity, quantityReserved: 0 });
        await inventory.save();
    }
    /********************************************
     * Обновить запись инвентаризации
     * @param batchId - идентификатор партии
     * @param warehouseId - идентификатор склада
     * @param changeQuantity - изменение количества
     ********************************************/
    static async update(batchId: string, warehouseId: string, changeQuantity: number) {
        const inventory: IInventoryModel | null = await InventoryModel.findOne({ batchId, warehouseId });
        if (!inventory) throw new Error('Инвентаризация не найдена');
        if (inventory.quantityAvailable + changeQuantity < 0) {
            throw new Error('Недостаточно доступного количества');
        }

        inventory.quantityAvailable += changeQuantity;
        await inventory.save();
    }
    /********************************************
     * Удалить запись инвентаризации
     * @param batchId - идентификатор партии
     * @param warehouseId - идентификатор склада
     ********************************************/
    static async delete(batchId: string, warehouseId: string) {
        if (!batchId || !warehouseId) throw new Error('Необходимы идентификаторы партии и склада');
        const inventory: IInventoryModel | null = await InventoryModel.findOne({ batchId, warehouseId });
        if (!inventory) throw new Error('Инвентаризация не найдена');
        if (inventory.quantityAvailable > 0 || inventory.quantityReserved > 0) {
            throw new Error('Невозможно удалить инвентаризацию с ненулевыми остатками');
        }
        if (inventory.lastUpdate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            throw new Error('Невозможно удалить инвентаризацию старше 24 часов');
        }
        await InventoryModel.deleteOne({ batchId, warehouseId });
    }

    /********************************************
     * Получить текущее доступное количество
     * @param batchId - идентификатор партии
     * @param warehouseId - идентификатор склада
     * @returns текущее доступное количество
     ********************************************/
    static async getCurrentAvailable(batchId: string, warehouseId: string) {
        const inventory: IInventoryModel | null = await InventoryModel.findOne({ batchId, warehouseId });
        return inventory ? inventory.quantityAvailable : 0;
    }
    /********************************************
     * Получить текущее зарезервированное количество
     * @param batchId - идентификатор партии
     * @param warehouseId - идентификатор склада
     * @returns текущее зарезервированное количество
     ********************************************/
    static async getCurrentReserved(batchId: string, warehouseId: string) {
        const inventory: IInventoryModel | null = await InventoryModel.findOne({ batchId, warehouseId });
        return inventory ? inventory.quantityReserved : 0;
    }
    
    /********************************************
     * Зарезервировать количество
     * @param productId - идентификатор продукта
     * @param quantity - количество
     ********************************************/
    static async reserve(productId: string, quantity: number) {
        if (quantity <= 0) throw new Error('Количество должно быть больше нуля');

        // 1. Получить все записи инвентаря по продукту
        const inventory: IInventoryModel[] = await InventoryModel.find({ productId }).populate('batchId');

        if (!inventory || inventory.length === 0) {
            throw new Error('Инвентаризация для данного продукта не найдена');
        }

        // 2. Получить актуальные партии (активные и не просроченные)
        /*Фильрация по срокам годности временно отключена
        
        const now = new Date();
        const activeInventory = inventory.filter(item => {
            const batch = item.batchId as unknown as IBatch; // предполагаем, что batchId заполнен
            if (!batch) return false;

            const isNotExpired = new Date(batch.expirationDate) > now;
            const isActive = batch.status === 'active';
            return isNotExpired && isActive;
        });
        */

        const activeInventory = inventory;

        // 3. Проверить суммарное количество
        const totalAvailable = activeInventory.reduce((sum, item) => sum + item.quantityAvailable, 0);
        if (totalAvailable < quantity) {
            throw new Error('Недостаточно доступного количества на активных партиях');
        }

        // 4. Сортируем по сроку годности (ближайший срок — первым, FIFO)
        activeInventory.sort((a, b) => {
            const expA = new Date((a.batchId as unknown as IBatch).expirationDate).getTime();
            const expB = new Date((b.batchId as unknown as IBatch).expirationDate).getTime();
            return expA - expB; // чем раньше срок — тем раньше резервируем
        });

        // 5. Распределяем резервирование по партиям
        let remaining = quantity;

        for (const item of activeInventory) {
            if (remaining <= 0) break;

            const availableInThisBatch = item.quantityAvailable;
            const take = Math.min(availableInThisBatch, remaining);

            item.quantityAvailable -= take;
            item.quantityReserved += take;
            remaining -= take;
        }

        // 6. Сохраняем изменения
        await Promise.all(activeInventory.map(item => item.save()));
    }

    /********************************************
     * Отменить резервирование
     * @param batchId - идентификатор партии
     * @param warehouseId - идентификатор склада
     * @param quantity - количество
     ********************************************/
    static async reserveCancel(batchId: string, warehouseId: string, quantity: number) {
        const inventory: IInventoryModel | null = await InventoryModel.findOne({ batchId, warehouseId });
        if (!inventory) throw new Error('Инвентаризация не найдена');

        if (inventory.quantityReserved < quantity) throw new Error('Недостаточно зарезервированного количества');

        inventory.quantityAvailable += quantity;
        inventory.quantityReserved -= quantity;

        await inventory.save();
    }
}   