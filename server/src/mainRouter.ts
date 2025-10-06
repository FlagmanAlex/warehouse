import { Router } from 'express'
import { authMiddleware } from '../src/middleware/authMiddleware';
import { 
    categoryRouter, 
    productRouter, 
    userRouter, 
    warehouseRouter, 
    batchRouter, 
    customerRouter, 
    inventoryRouter, 
    docRouter, 
    docItemssRouter, 
    priceHistoryRouter, 
    supplierRouter, 
    transactionRouter, 
} from '@routers';

export const mainRouter = Router()

mainRouter.use('/category', authMiddleware, categoryRouter);
mainRouter.use('/product', authMiddleware, productRouter);
mainRouter.use('/auth', userRouter)
mainRouter.use('/warehouse', authMiddleware, warehouseRouter);
mainRouter.use('/batch', authMiddleware, batchRouter);
mainRouter.use('/customer', authMiddleware, customerRouter);
mainRouter.use('/inventory', authMiddleware, inventoryRouter);
mainRouter.use('/doc', authMiddleware, docRouter);
mainRouter.use('/doc-items', authMiddleware, docItemssRouter);
mainRouter.use('/price-history', authMiddleware, priceHistoryRouter);
mainRouter.use('/supplier', authMiddleware, supplierRouter);
mainRouter.use('/transaction', authMiddleware, transactionRouter);
