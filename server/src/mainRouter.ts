import { Router } from 'express'
import { authMiddleware } from '@middlewares';
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
    addressRouter, 
    deliveryRouter
    
} from '@routes';

export const mainRouter = Router()

mainRouter.use('/address', authMiddleware, addressRouter);
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
mainRouter.use('/delivery', authMiddleware, deliveryRouter);
mainRouter.use('/upload', authMiddleware );
