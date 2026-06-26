import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockInventory } from './helpers/mockModels.js';

vi.mock('@models', () => ({
    InventoryModel: {
        find: vi.fn(),
        findOne: vi.fn(),
    },
}));

import { InventoryModel } from '@models';
import { InventoryService } from '../src/services/InventoryService.js';

const mockedInventory = InventoryModel as any;

beforeEach(() => {
    vi.clearAllMocks();
});

describe('InventoryService.reserve', () => {
    it('бросает ошибку если quantity <= 0', async () => {
        await expect(InventoryService.reserve('prod-1', 0)).rejects.toThrow(
            'Количество должно быть больше нуля'
        );
        await expect(InventoryService.reserve('prod-1', -1)).rejects.toThrow(
            'Количество должно быть больше нуля'
        );
    });

    it('бросает ошибку если инвентарь не найден', async () => {
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([]),
        });

        await expect(InventoryService.reserve('prod-1', 5)).rejects.toThrow(
            'Инвентаризация для данного продукта не найдена'
        );
    });

    it('бросает ошибку если товара недостаточно', async () => {
        const inv = createMockInventory({ quantityAvailable: 3 });
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([inv]),
        });

        await expect(InventoryService.reserve('prod-1', 10)).rejects.toThrow(
            'Недостаточно доступного количества'
        );
    });

    it('резервирует из одной партии если хватает', async () => {
        const inv = createMockInventory({ quantityAvailable: 10, quantityReserved: 0 });
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([inv]),
        });

        await InventoryService.reserve('prod-1', 4);

        expect(inv.quantityAvailable).toBe(6);
        expect(inv.quantityReserved).toBe(4);
        expect(inv.save).toHaveBeenCalled();
    });

    it('FIFO: распределяет по 2 партиям, сначала ближайший срок', async () => {
        const earlyInv = createMockInventory({
            _id: 'inv-early',
            batchId: { _id: 'b-early', expirationDate: new Date('2025-06-01') },
            quantityAvailable: 3,
            quantityReserved: 0,
        });
        const lateInv = createMockInventory({
            _id: 'inv-late',
            batchId: { _id: 'b-late', expirationDate: new Date('2026-12-31') },
            quantityAvailable: 10,
            quantityReserved: 0,
        });

        // Передаём в обратном порядке — FIFO должен отсортировать
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([lateInv, earlyInv]),
        });

        await InventoryService.reserve('prod-1', 7);

        // earlyInv исчерпан (3 ед.), lateInv добирает оставшиеся 4
        expect(earlyInv.quantityAvailable).toBe(0);
        expect(earlyInv.quantityReserved).toBe(3);
        expect(lateInv.quantityAvailable).toBe(6);
        expect(lateInv.quantityReserved).toBe(4);
    });
});

describe('InventoryService.reserveCancel', () => {
    it('переносит с reserved обратно в available', async () => {
        const inv = createMockInventory({ quantityAvailable: 5, quantityReserved: 10 });
        mockedInventory.findOne.mockResolvedValue(inv);

        await InventoryService.reserveCancel('batch-1', 'wh-1', 3);

        expect(inv.quantityReserved).toBe(7);
        expect(inv.quantityAvailable).toBe(8);
        expect(inv.save).toHaveBeenCalled();
    });

    it('бросает ошибку если зарезервированного недостаточно', async () => {
        const inv = createMockInventory({ quantityAvailable: 5, quantityReserved: 2 });
        mockedInventory.findOne.mockResolvedValue(inv);

        await expect(
            InventoryService.reserveCancel('batch-1', 'wh-1', 5)
        ).rejects.toThrow('Недостаточно зарезервированного количества');
    });

    it('бросает ошибку если инвентарь не найден', async () => {
        mockedInventory.findOne.mockResolvedValue(null);

        await expect(
            InventoryService.reserveCancel('batch-1', 'wh-1', 1)
        ).rejects.toThrow('Инвентаризация не найдена');
    });
});
