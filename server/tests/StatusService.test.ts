import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDoc, createMockDocItem, createMockInventory, createMockTransaction } from './helpers/mockModels.js';

vi.mock('@models', () => ({
    DocModel: { findById: vi.fn() },
    DocItemsModel: { find: vi.fn() },
    InventoryModel: {
        find: vi.fn(),
        updateOne: vi.fn(),
    },
    TransactionModel: {
        create: vi.fn(),
        find: vi.fn(),
        deleteMany: vi.fn(),
    },
    // unused but exported from @models
    BatchModel: {},
    AccountModel: {},
}));

import { DocModel, DocItemsModel, InventoryModel, TransactionModel } from '@models';
import { StatusService } from '../src/services/StatusService.js';

const mockedDocModel = DocModel as any;
const mockedDocItems = DocItemsModel as any;
const mockedInventory = InventoryModel as any;
const mockedTransaction = TransactionModel as any;

beforeEach(() => {
    vi.clearAllMocks();
    mockedTransaction.create.mockResolvedValue({});
    mockedTransaction.find.mockResolvedValue([]);
    mockedTransaction.deleteMany.mockResolvedValue({});
    mockedInventory.updateOne.mockResolvedValue({});
});

describe('StatusService.updateStatus — базовая валидация', () => {
    it('без userId → бросает "Пользователь не авторизован"', async () => {
        await expect(
            StatusService.updateStatus('doc-id-1', 'InProgress', undefined)
        ).rejects.toThrow('Пользователь не авторизован');
    });

    it('документ не найден → бросает "Документ не найден"', async () => {
        mockedDocModel.findById.mockResolvedValue(null);

        await expect(
            StatusService.updateStatus('doc-id-1', 'InProgress', 'user-1')
        ).rejects.toThrow('Документ не найден');
    });

    it('переход в тот же статус → возвращает doc без изменений', async () => {
        const mockDoc = createMockDoc({ docStatus: 'Draft' });
        mockedDocModel.findById.mockResolvedValue(mockDoc);

        const result = await StatusService.updateStatus('doc-id-1', 'Draft', 'user-1');

        expect(result).toBe(mockDoc);
        expect(mockDoc.save).not.toHaveBeenCalled();
    });

    it('запрещённый переход (Completed → InProgress) → бросает ошибку', async () => {
        const mockDoc = createMockDoc({ docStatus: 'Completed', docType: 'OrderOut' });
        mockedDocModel.findById.mockResolvedValue(mockDoc);

        await expect(
            StatusService.updateStatus('doc-id-1', 'InProgress', 'user-1')
        ).rejects.toThrow(/запрещен/);
    });
});

describe('StatusService — OrderOut: Draft → InProgress (резервирование)', () => {
    it('резервирует товар: quantityAvailable уменьшается, quantityReserved растёт', async () => {
        const mockDoc = createMockDoc({ docType: 'OrderOut', docStatus: 'Draft' });
        const mockItem = createMockDocItem({ productId: 'prod-1', quantity: 3 });
        const mockInv = createMockInventory({ quantityAvailable: 10, quantityReserved: 0 });

        mockedDocModel.findById.mockResolvedValue(mockDoc);
        mockedDocItems.find.mockResolvedValue([mockItem]);
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([mockInv]),
        });

        await StatusService.updateStatus('doc-id-1', 'InProgress', 'user-1');

        expect(mockInv.quantityAvailable).toBe(7);
        expect(mockInv.quantityReserved).toBe(3);
        expect(mockInv.save).toHaveBeenCalled();
        expect(mockDoc.save).toHaveBeenCalled();
    });

    it('бросает ошибку если товара недостаточно', async () => {
        const mockDoc = createMockDoc({ docType: 'OrderOut', docStatus: 'Draft' });
        const mockItem = createMockDocItem({ quantity: 20 });
        const mockInv = createMockInventory({ quantityAvailable: 5 });

        mockedDocModel.findById.mockResolvedValue(mockDoc);
        mockedDocItems.find.mockResolvedValue([mockItem]);
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([mockInv]),
        });

        await expect(
            StatusService.updateStatus('doc-id-1', 'InProgress', 'user-1')
        ).rejects.toThrow(/Недостаточно товара/);
    });

    it('FIFO: сначала берёт с партии с ближайшим сроком годности', async () => {
        const mockDoc = createMockDoc({ docType: 'OrderOut', docStatus: 'Draft' });
        const mockItem = createMockDocItem({ quantity: 8 });

        const earlyInv = createMockInventory({
            batchId: { _id: 'b-early', expirationDate: new Date('2026-01-01') },
            quantityAvailable: 5,
            quantityReserved: 0,
        });
        const lateInv = createMockInventory({
            _id: 'inv-id-2',
            batchId: { _id: 'b-late', expirationDate: new Date('2027-01-01') },
            quantityAvailable: 10,
            quantityReserved: 0,
        });

        mockedDocModel.findById.mockResolvedValue(mockDoc);
        mockedDocItems.find.mockResolvedValue([mockItem]);
        // populate возвращает в "случайном" порядке — поздняя партия первой
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([lateInv, earlyInv]),
        });

        await StatusService.updateStatus('doc-id-1', 'InProgress', 'user-1');

        // FIFO: сначала earlyInv (5 ед.), потом lateInv (3 ед.)
        expect(earlyInv.quantityAvailable).toBe(0);
        expect(earlyInv.quantityReserved).toBe(5);
        expect(lateInv.quantityAvailable).toBe(7);
        expect(lateInv.quantityReserved).toBe(3);
    });
});

describe('StatusService — OrderOut: InProgress → Completed (списание)', () => {
    it('создаёт транзакцию типа Расход', async () => {
        const mockDoc = createMockDoc({ docType: 'OrderOut', docStatus: 'InProgress' });
        const mockItem = createMockDocItem({ quantity: 5 });
        const mockInv = createMockInventory({ quantityAvailable: 0, quantityReserved: 10 });

        mockedDocModel.findById.mockResolvedValue(mockDoc);
        mockedDocItems.find.mockResolvedValue([mockItem]);
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([mockInv]),
        });

        await StatusService.updateStatus('doc-id-1', 'Completed', 'user-1');

        expect(mockedTransaction.create).toHaveBeenCalledWith(
            expect.objectContaining({ transactionType: 'Расход', changedQuantity: -5 })
        );
        expect(mockInv.quantityReserved).toBe(5);
    });
});

describe('StatusService — OrderOut: InProgress → Canceled (снятие резерва)', () => {
    it('переносит quantityReserved обратно в quantityAvailable', async () => {
        const mockDoc = createMockDoc({ docType: 'OrderOut', docStatus: 'InProgress' });
        const mockItem = createMockDocItem({ quantity: 5 });
        const mockInv = createMockInventory({ quantityAvailable: 0, quantityReserved: 10 });

        mockedDocModel.findById.mockResolvedValue(mockDoc);
        mockedDocItems.find.mockResolvedValue([mockItem]);
        mockedInventory.find.mockReturnValue({
            populate: vi.fn().mockResolvedValue([mockInv]),
        });

        await StatusService.updateStatus('doc-id-1', 'Canceled', 'user-1');

        expect(mockInv.quantityReserved).toBe(5);
        expect(mockInv.quantityAvailable).toBe(5);
        expect(mockedTransaction.create).not.toHaveBeenCalled();
    });
});

describe('StatusService — OrderOut: Completed → Canceled (откат)', () => {
    it('восстанавливает остатки и удаляет транзакции', async () => {
        const mockDoc = createMockDoc({ docType: 'OrderOut', docStatus: 'Completed' });
        const mockTx = createMockTransaction({ changedQuantity: -5, batchId: 'b-1', warehouseId: 'wh-1' });

        mockedDocModel.findById.mockResolvedValue(mockDoc);
        mockedTransaction.find.mockResolvedValue([mockTx]);

        await StatusService.updateStatus('doc-id-1', 'Canceled', 'user-1');

        expect(mockedInventory.updateOne).toHaveBeenCalledWith(
            { batchId: 'b-1', warehouseId: 'wh-1' },
            { $inc: { quantityAvailable: 5 } }
        );
        expect(mockedTransaction.deleteMany).toHaveBeenCalledWith({
            docId: 'doc-id-1',
            transactionType: 'Расход',
        });
    });
});
