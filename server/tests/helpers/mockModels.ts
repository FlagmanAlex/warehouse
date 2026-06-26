import { vi } from 'vitest';

export const createMockDoc = (overrides: Record<string, any> = {}) => ({
    _id: 'doc-id-1',
    docType: 'OrderOut',
    docStatus: 'Draft',
    warehouseId: 'warehouse-id-1',
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

export const createMockInventory = (overrides: Record<string, any> = {}) => ({
    _id: 'inv-id-1',
    productId: 'product-id-1',
    warehouseId: 'warehouse-id-1',
    batchId: { _id: 'batch-id-1', expirationDate: new Date('2026-12-31') },
    quantityAvailable: 10,
    quantityReserved: 0,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

export const createMockDocItem = (overrides: Record<string, any> = {}) => ({
    _id: 'item-id-1',
    docId: 'doc-id-1',
    productId: 'product-id-1',
    quantity: 5,
    unitPrice: 100,
    bonusStock: 0,
    ...overrides,
});

export const createMockTransaction = (overrides: Record<string, any> = {}) => ({
    _id: 'tx-id-1',
    transactionType: 'Расход',
    docId: 'doc-id-1',
    productId: 'product-id-1',
    warehouseId: 'warehouse-id-1',
    batchId: 'batch-id-1',
    changedQuantity: -5,
    previousQuantity: 10,
    ...overrides,
});
