import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { docValidators, handleValidationErrors, productValidators } from '../src/middlewares/validators.js';

const runChain = async (chain: any[], body: Record<string, any>) => {
    const req = { body } as Request;
    for (const middleware of chain) {
        await new Promise<void>((resolve, reject) => {
            middleware(req, {} as Response, (err?: any) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    return req;
};

const mockRes = () => {
    const r = {} as Response;
    r.status = vi.fn().mockReturnValue(r);
    r.json = vi.fn().mockReturnValue(r);
    return r;
};

describe('docValidators', () => {
    it('валидный запрос → next() вызван', async () => {
        const req = await runChain(docValidators, {
            doc: { docType: 'OrderOut', docDate: '2025-01-01T00:00:00.000Z' },
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('невалидный docType → 400 с errors', async () => {
        const req = await runChain(docValidators, {
            doc: { docType: 'Unknown', docDate: '2025-01-01T00:00:00.000Z' },
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ errors: expect.arrayContaining([expect.anything()]) })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('невалидная дата docDate → 400 с errors', async () => {
        const req = await runChain(docValidators, {
            doc: { docType: 'OrderOut', docDate: 'not-a-date' },
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ errors: expect.arrayContaining([expect.anything()]) })
        );
    });

    it('не-OrderOut без warehouseId → 400 с errors', async () => {
        const req = await runChain(docValidators, {
            doc: { docType: 'Incoming', docDate: '2025-01-01T00:00:00.000Z' },
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('OrderOut без warehouseId → OK (warehouseId не требуется)', async () => {
        const req = await runChain(docValidators, {
            doc: { docType: 'OrderOut', docDate: '2025-01-01T00:00:00.000Z' },
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});

describe('productValidators', () => {
    it('валидные данные → next() вызван', async () => {
        const req = await runChain(productValidators, {
            name: 'Тестовый продукт',
            article: 'ART-001',
            price: 100,
            productType: 'Parfum',
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('отрицательная цена → 400 с errors', async () => {
        const req = await runChain(productValidators, {
            name: 'Продукт',
            article: 'ART-001',
            price: -5,
            productType: 'Parfum',
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('пустой name → 400 с errors', async () => {
        const req = await runChain(productValidators, {
            name: '',
            article: 'ART-001',
            price: 100,
            productType: 'Parfum',
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('невалидный productType → 400 с errors', async () => {
        const req = await runChain(productValidators, {
            name: 'Продукт',
            article: 'ART-001',
            price: 100,
            productType: 'Unknown',
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('цена = 0 → валидна', async () => {
        const req = await runChain(productValidators, {
            name: 'Продукт',
            article: 'ART-001',
            price: 0,
            productType: 'Vitamin',
        });

        const res = mockRes();
        const next = vi.fn();
        handleValidationErrors(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
