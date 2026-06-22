import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

export const docValidators = [
    body('doc.docType')
        .isIn(['OrderOut', 'OrderIn', 'Incoming', 'Outgoing', 'Transfer'])
        .withMessage('Недопустимый тип документа'),
    body('doc.docDate')
        .isISO8601()
        .withMessage('Некорректная дата документа'),
    body('doc.warehouseId')
        .if(body('doc.docType').not().equals('OrderOut'))
        .notEmpty()
        .withMessage('Склад обязателен'),
];

export const productValidators = [
    body('name').notEmpty().withMessage('Наименование обязательно'),
    body('article').notEmpty().withMessage('Артикул обязателен'),
    body('price').isFloat({ min: 0 }).withMessage('Цена должна быть ≥ 0'),
    body('productType')
        .isIn(['Parfum', 'Vitamin', 'Sport', 'Cosmetic'])
        .withMessage('Недопустимый тип продукта'),
];
