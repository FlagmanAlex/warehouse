import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@models', () => ({
    DocModel: { find: vi.fn() },
    DocItemsModel: { find: vi.fn() },
}));

import { DocModel, DocItemsModel } from '@models';
import { DocService } from '../src/services/DocService.js';

const mockedDocModel = DocModel as any;
const mockedDocItems = DocItemsModel as any;

const makeDocFindChain = (docs: any[]) => ({
    populate: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(docs),
    }),
});

const makeItemsFindChain = (items: any[]) => ({
    populate: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(items),
    }),
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('DocService.getByStatus', () => {
    it('нет документов → возвращает []', async () => {
        mockedDocModel.find.mockReturnValue(makeDocFindChain([]));

        const result = await DocService.getByStatus('Draft');

        expect(result).toEqual([]);
        expect(mockedDocItems.find).not.toHaveBeenCalled();
    });

    it('2 документа одного клиента → 1 группа с суммарными итогами', async () => {
        const customerId = { _id: 'cust-1', name: 'ООО Тест' };
        const docs = [
            { _id: 'doc-1', customerId, docStatus: 'Draft' },
            { _id: 'doc-2', customerId, docStatus: 'Draft' },
        ];
        const items = [
            { docId: 'doc-1', quantity: 2, unitPrice: 100, bonusStock: 10 },
            { docId: 'doc-2', quantity: 3, unitPrice: 50, bonusStock: 0 },
        ];

        mockedDocModel.find.mockReturnValue(makeDocFindChain(docs));
        mockedDocItems.find.mockReturnValue(makeItemsFindChain(items));

        const result = await DocService.getByStatus('Draft');

        expect(result).toHaveLength(1);
        expect(result[0].customerName).toBe('ООО Тест');
        expect(result[0].docs).toHaveLength(2);
        // totalSum = 2*100 + 3*50 = 350
        expect(result[0].totalSum).toBe(350);
        // totalBonus = 2*10 + 3*0 = 20
        expect(result[0].totalBonus).toBe(20);
        // totalPositions = 2 + 3 = 5
        expect(result[0].totalPositions).toBe(5);
    });

    it('2 документа разных клиентов → 2 группы', async () => {
        const cust1 = { _id: 'cust-1', name: 'Клиент А' };
        const cust2 = { _id: 'cust-2', name: 'Клиент Б' };
        const docs = [
            { _id: 'doc-1', customerId: cust1, docStatus: 'Draft' },
            { _id: 'doc-2', customerId: cust2, docStatus: 'Draft' },
        ];
        const items = [
            { docId: 'doc-1', quantity: 1, unitPrice: 100, bonusStock: 0 },
            { docId: 'doc-2', quantity: 2, unitPrice: 200, bonusStock: 0 },
        ];

        mockedDocModel.find.mockReturnValue(makeDocFindChain(docs));
        mockedDocItems.find.mockReturnValue(makeItemsFindChain(items));

        const result = await DocService.getByStatus('Draft');

        expect(result).toHaveLength(2);
        const names = result.map((g: any) => g.customerName).sort();
        expect(names).toEqual(['Клиент А', 'Клиент Б']);
    });

    it('totalSum и totalBonus считаются правильно: Σ(qty * price) и Σ(qty * bonus)', async () => {
        const customerId = { _id: 'cust-1', name: 'Тест' };
        const docs = [{ _id: 'doc-1', customerId, docStatus: 'InProgress' }];
        const items = [
            { docId: 'doc-1', quantity: 3, unitPrice: 200, bonusStock: 50 },
            { docId: 'doc-1', quantity: 2, unitPrice: 100, bonusStock: 0 },
        ];

        mockedDocModel.find.mockReturnValue(makeDocFindChain(docs));
        mockedDocItems.find.mockReturnValue(makeItemsFindChain(items));

        const result = await DocService.getByStatus('InProgress');

        // totalSum = 3*200 + 2*100 = 800
        expect(result[0].totalSum).toBe(800);
        // totalBonus = 3*50 + 2*0 = 150
        expect(result[0].totalBonus).toBe(150);
    });
});
