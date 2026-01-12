import { Request, Response } from 'express';
import { BatchModel } from '@models';

export class BatchController {
    static createBatch = async (req: Request, res: Response) => {
        const data = req.body;
        try {
            if (
                !data.productId ||
                !data.quantityReceived ||
                // !data.purchasePrice ||
                !data.expirationDate // Срок реализации пока не активен
            ) {
                res.status(400).json({ error: 'Не указаны обязательные поля' });
                console.log('Не указаны обязательные поля', data);
                throw Error('Не указаны обязательные поля');
            }

            const batch = await BatchModel.create({
                ...data,
                expirationDate: new Date(data.expirationDate),
                receiptDate: new Date(data.receiptDate)
            });

            res.status(201).json(batch);
        } catch (error) {
            console.error('Ошибка при создании партии');
            res.status(500).json({
                error: 'Ошибка при создании партии',
                details: (error as Error).message
            });
        }
    };

    // Получение партии по ID
    static getBatchById = async (req: Request, res: Response) => {
        try {
            const batch = await BatchModel.findById(req.params.id)
                .populate('productId')
                .populate('supplierId');

            if (!batch) {
                res.status(404).json({ error: 'Партия не найдена' });
                return
            }
            res.json(batch);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении партии' });
        }
    };

    // Получение всех партий для товара
    static getBatchesByProduct = async (req: Request, res: Response) => {
        try {
            const batches = await BatchModel.find({ productId: req.params.productId })
                .sort({ receiptDate: -1 });
            res.json(batches);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении партий' });
        }
    };

    // Обновление статуса партии (например, при просрочке)
    static updateBatchStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body;
            const batch = await BatchModel.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );
            res.json(batch);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при обновлении статуса' });
        }
    };
}