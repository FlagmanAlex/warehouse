import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDocItem } from './helpers/mockModels.js';

vi.mock('@models', () => ({
    DocItemsModel: { find: vi.fn() },
    DocModel: { updateOne: vi.fn() },
}));

import { DocItemsModel, DocModel } from '@models';
import { recalculateDocSum } from '../src/utils/recalculateDocSum.js';

const mockedFind = DocItemsModel.find as ReturnType<typeof vi.fn>;
const mockedUpdateOne = DocModel.updateOne as ReturnType<typeof vi.fn>;

beforeEach(() => {
    vi.clearAllMocks();
    mockedUpdateOne.mockResolvedValue({ matchedCount: 1 });
});

describe('recalculateDocSum', () => {
    it('вычисляет сумму как Σ(quantity * (unitPrice - bonusStock))', async () => {
        mockedFind.mockReturnValue({
            lean: vi.fn().mockResolvedValue([
                createMockDocItem({ quantity: 3, unitPrice: 100, bonusStock: 10 }),
                createMockDocItem({ quantity: 2, unitPrice: 50, bonusStock: 0 }),
            ]),
        });

        await recalculateDocSum('507f1f77bcf86cd799439011');

        expect(mockedUpdateOne).toHaveBeenCalledWith(
            expect.objectContaining({ _id: expect.anything() }),
            { $set: { summ: 370, itemCount: 5 } }
        );
    });

    it('считает itemCount как Σ(quantity)', async () => {
        mockedFind.mockReturnValue({
            lean: vi.fn().mockResolvedValue([
                createMockDocItem({ quantity: 4, unitPrice: 100, bonusStock: 0 }),
                createMockDocItem({ quantity: 6, unitPrice: 200, bonusStock: 0 }),
            ]),
        });

        await recalculateDocSum('507f1f77bcf86cd799439011');

        expect(mockedUpdateOne).toHaveBeenCalledWith(
            expect.anything(),
            { $set: { summ: 1600, itemCount: 10 } }
        );
    });

    it('при пустом массиве позиций: summ = 0, itemCount = 0', async () => {
        mockedFind.mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
        });

        await recalculateDocSum('507f1f77bcf86cd799439011');

        expect(mockedUpdateOne).toHaveBeenCalledWith(
            expect.anything(),
            { $set: { summ: 0, itemCount: 0 } }
        );
    });

    it('не падает при bonusStock больше unitPrice (отрицательный вклад)', async () => {
        mockedFind.mockReturnValue({
            lean: vi.fn().mockResolvedValue([
                createMockDocItem({ quantity: 2, unitPrice: 10, bonusStock: 50 }),
            ]),
        });

        await recalculateDocSum('507f1f77bcf86cd799439011');

        // summ = 2 * (10 - 50) = -80, не бросает исключение
        expect(mockedUpdateOne).toHaveBeenCalledWith(
            expect.anything(),
            { $set: { summ: -80, itemCount: 2 } }
        );
    });
});
