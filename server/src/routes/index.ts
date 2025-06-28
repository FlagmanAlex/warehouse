import { Router } from 'express'
import { categoryRouter } from './categoryRouter';
import { productRouter } from './productRouter';
import { userRouter } from './userRouter';
import { warehouseRouter } from './warehouseRouter';
import { batchRouter } from './batchRouter';
import { customerRouter } from './customerRouter';
import { inventoryRouter } from './inventoryRouter';
import { orderRouter } from './orderRouter';
import { orderDetailsRouter } from './orderDetailsRouter';
import { priceHistoryRouter } from './priceHistoryRouter';
import { supplierRouter } from './supplierRouter';
import { transactionRouter } from './transactionRouter';
import { authMiddleware } from '../middleware/authMiddleware';

export const mainRouter = Router()

mainRouter.use('/category', authMiddleware, categoryRouter);
mainRouter.use('/product', authMiddleware, productRouter);
mainRouter.use('/auth', userRouter)
mainRouter.use('/warehouse', authMiddleware, warehouseRouter);
mainRouter.use('/batch', authMiddleware, batchRouter);
mainRouter.use('/customer', authMiddleware, customerRouter);
mainRouter.use('/inventory', authMiddleware, inventoryRouter);
mainRouter.use('/order', authMiddleware, orderRouter);
mainRouter.use('/order-details', authMiddleware, orderDetailsRouter);
mainRouter.use('/price-history', authMiddleware, priceHistoryRouter);
mainRouter.use('/supplier', authMiddleware, supplierRouter);
mainRouter.use('/transaction', authMiddleware, transactionRouter);