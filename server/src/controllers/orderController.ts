import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { IOrderModel, OrderModel } from '../models/orderModel';
import { OrderDetailsModel } from '../models/orderDetailsModel';
import { InventoryModel } from '../models/inventoryModel';
import { TransactionModel } from '../models/transactionModel';
import { IOrderDetails } from '../../../interfaces/IOrderDetails';
import { OrderNumModel } from '../models/orderNumModel';
import { IBatch } from '../../../interfaces/IBatch';
import { BatchModel } from '../models/batchModel';


export class OrderController {

    static async getAllOrders(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            // Парсинг дат из строки запроса
            let filter: any = {};
            if (startDate && endDate) {
                filter.orderDate = {
                    $gte: new Date(startDate as string),
                    $lte: new Date(endDate as string)
                };
            }

            const orders = await OrderModel.find(filter)
                .populate('supplierId warehouseId')
                .populate('customerId', 'name phone')
                .populate('userId', 'username')
                .sort({ orderDate: 1 }); // самые новые первыми

            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении списка заказов' });
        }
    }
    /**
     * Создание заказа
     * @param req body: IOrder, body.items: IOrderDetails[]
     * @returns order: IOrder, details: IOrderDetails
     */
    static async createOrder(req: Request, res: Response) {
        const createdEntities: any = {};
        const body = req.body;

        try {
            // Валидация
            if (!['Приход', 'Расход', 'Перемещение'].includes(body.orderType)) {
                throw new Error('Некорректный тип заказа');
            }

            if (body.orderType === 'Приход' && !body.customerId) {
                throw new Error('Для заказа "Приход" необходимо указать customerId');
            }

            if (body.orderType === 'Расход' && !body.supplierId) {
                throw new Error('Для заказа "Расход" необходимо указать supplierId');
            }

            if (!body.warehouseId || !body.userId) {
                throw new Error('Не все обязательные поля переданы');
            }

            // console.log(body);


            // Генерация orderNum
            let prefix = '';
            switch (body.orderType) {
                case 'Приход':
                    prefix = 'ПР';
                    break;
                case 'Расход':
                    prefix = 'РС';
                    break;
                case 'Перемещение':
                    prefix = 'ПМ';
                    break;
            }

            const sequence = await OrderNumModel.findByIdAndUpdate(
                prefix,
                { $inc: { nextNumber: 1 } },
                { upsert: true, new: true }
            );

            const orderNum = `${prefix}${String(sequence.nextNumber).padStart(6, '0')}`;
            body.orderNum = orderNum; // Перезаписываем orderNum в теле запроса

            // Проверка наличия товаров (для расходных заказов)
            if (body.orderType === 'Расход') {
                for (const item of body.items) {

                    const inventoryDocs = await InventoryModel.find({
                        productId: item.productId,
                        warehouseId: body.warehouseId
                    });

                    const totalInventory = inventoryDocs.reduce((sum, inv) => sum + inv.quantityAvailable, 0);
                    // console.log('totalInventory:', totalInventory);

                    if (totalInventory < item.quantity) {
                        throw new Error(`Недостаточно товара (ID продукта: ${item.productId}, склад: ${body.warehouseId})`);
                    }
                }

            }

            // Создание заказа
            const order = await OrderModel.create({
                orderDate: new Date(body.orderDate),
                orderNum: orderNum,
                docNum: body.docNum,
                vendorCode: body.vendorCode,
                orderType: body.orderType,
                exchangeRate: body.exchangeRate,
                bonusRef: body.bonusRef,
                supplierId: body.orderType === 'Приход' ? body.supplierId : null,
                customerId: body.orderType === 'Расход' ? body.customerId : null,
                warehouseId: body.warehouseId,
                userId: body.userId,
                status: body.status
            });
            createdEntities.order = order;

            // Создание позиций заказа
            const orderDetails: IOrderDetails[] = body.items.map((item: IOrderDetails) => {
                const orderDetail: IOrderDetails = {
                    orderId: order._id,
                    batchId: new Types.ObjectId, // партия определяется при списании для расходов
                    productId: item.productId,
                    quantity: item.quantity,
                    bonusStock: item.bonusStock,
                    unitPrice: item.unitPrice
                };
                return orderDetail;
            });

            await OrderDetailsModel.insertMany(orderDetails)
            createdEntities.orderDetails = orderDetails

            for (const item of orderDetails) {

                const productId = item.productId
                const warehouseId = body.warehouseId

                // Определяем, насколько меняется количество
                let changeQuantity = 0;
                if (body.orderType === 'Приход') {
                    changeQuantity = item.quantity;
                } else if (body.orderType === 'Расход') {
                    changeQuantity = -item.quantity;
                }

                if (body.orderType === 'Приход') {
                    const createBatch: IBatch = {
                        productId,
                        supplierId: order.supplierId!,
                        receiptDate: new Date(order.orderDate),
                        purchasePrice: (item.unitPrice * (order.exchangeRate ?? 1)) || 0,
                        expirationDate: new Date('2026-01-01'),
                        quantityReceived: item.quantity,
                        unitOfMeasure: 'шт',
                        status: 'активный',
                        warehouseId
                    }

                    const batch = await BatchModel.create(createBatch)
                    createdEntities.batch = batch

                    // Обновляем остатки
                    const inventory = await InventoryModel.findOneAndUpdate(
                        { batchId: batch._id, warehouseId },
                        {
                            $inc: { quantityAvailable: changeQuantity },
                            $setOnInsert: { productId }
                        },
                        { upsert: true, new: true }
                    );

                    if (!inventory) {
                        throw new Error(`Не удалось обновить остатки для партии ${batch._id}`);
                    }

                    // Создаём транзакцию
                    const transaction = await TransactionModel.create({
                        transactionType: 'Приход',
                        productId,
                        batchId: batch._id,
                        warehouseId,
                        changeQuantity,
                        previousQuantity: 0,
                        userId: body.userId,
                        orderId: order._id
                    });

                    createdEntities.transactions = transaction

                    // Привязываем партию к позиции заказа
                    await OrderDetailsModel.updateOne(
                        { _id: item._id },
                        { $set: { batchId: batch._id } }
                    );
                }

                // ================ Для Расхода: списываем со склада партии по товару ================

                else if (body.orderType === 'Расход') {
                    let remainingQty = item.quantity;

                    // Получаем доступные партии (FIFO)
                    const inventoryDocs = await InventoryModel.find({
                        productId,
                        warehouseId,
                        quantityAvailable: { $gt: 0 }
                    }).sort({ createdAt: 1 }); // самые старые партии первыми

                    for (const inv of inventoryDocs) {
                        const available = inv.quantityAvailable;
                        const qtyToTake = Math.min(available, remainingQty);

                        // Обновляем остаток
                        await InventoryModel.updateOne(
                            { _id: inv._id },
                            { $inc: { quantityAvailable: -qtyToTake } }
                        );

                        // Создаём транзакцию
                        const transaction = await TransactionModel.create({
                            transactionType: 'Расход',
                            productId,
                            batchId: inv.batchId,
                            warehouseId,
                            changeQuantity: -qtyToTake,
                            previousQuantity: inv.quantityAvailable,
                            userId: body.userId,
                            orderId: order._id
                        });

                        createdEntities.transactions = transaction
                        remainingQty -= qtyToTake;

                        if (remainingQty <= 0) break;
                    }

                    if (remainingQty > 0) {
                        throw new Error(`Не хватает товара на складе для продукта ${productId}`);
                    }
                }

                // ================ Для Перемещения: списываем со склада fromWarehouseId и добавляем на toWarehouseId ================

                else if (body.orderType === 'Перемещение') {
                    const fromWarehouseId = body.fromWarehouseId;
                    const toWarehouseId = body.toWarehouseId;
                    const warehouseId = body.warehouseId; // Может использоваться как отчётный склад

                    if (!fromWarehouseId || !toWarehouseId) {
                        throw new Error('Для заказа "Перемещение" необходимо указать fromWarehouseId и toWarehouseId');
                    }

                    let remainingQty = item.quantity;

                    // Получаем партии на исходном складе (fromWarehouseId)
                    const sourceInventories = await InventoryModel.find({
                        productId,
                        warehouseId: fromWarehouseId,
                        quantityAvailable: { $gt: 0 }
                    }).sort({ createdAt: 1 }); // FIFO

                    for (const inv of sourceInventories) {
                        const available = inv.quantityAvailable;
                        const qtyToMove = Math.min(available, remainingQty);

                        // Списываем со склада A
                        await InventoryModel.updateOne(
                            { _id: inv._id },
                            { $inc: { quantityAvailable: -qtyToMove } }
                        );

                        // Создаём транзакцию списания
                        const outTransaction = await TransactionModel.create({
                            transactionType: 'Расход',
                            productId,
                            batchId: inv.batchId,
                            warehouseId: fromWarehouseId,
                            changeQuantity: -qtyToMove,
                            previousQuantity: inv.quantityAvailable,
                            userId: body.userId,
                            orderId: order._id
                        });
                        createdEntities.transactions.push(outTransaction);

                        // Добавляем на склад B
                        const targetInventory = await InventoryModel.findOneAndUpdate(
                            { batchId: inv.batchId, warehouseId: toWarehouseId },
                            { $inc: { quantityAvailable: qtyToMove } },
                            { upsert: true, new: true }
                        );

                        if (!targetInventory) {
                            throw new Error(`Не удалось обновить остатки для партии ${inv.batchId} на складе ${toWarehouseId}`);
                        }

                        // Создаём транзакцию прихода
                        const inTransaction = await TransactionModel.create({
                            transactionType: 'Приход',
                            productId,
                            batchId: inv.batchId,
                            warehouseId: toWarehouseId,
                            changeQuantity: qtyToMove,
                            previousQuantity: targetInventory?.quantityAvailable || 0,
                            userId: body.userId,
                            orderId: order._id
                        });
                        createdEntities.transactions.push(inTransaction);

                        remainingQty -= qtyToMove;

                        if (remainingQty <= 0) break;
                    }

                    if (remainingQty > 0) {
                        throw new Error(`Не хватает товара на складе ${fromWarehouseId} для продукта ${productId}`);
                    }
                }
            }

            res.status(201).json({ order, details: orderDetails });
        } catch (error) {
            console.error('Ошибка создания заказа:', error);

            try {
                await this.rollbackOrderCreation(createdEntities);
            } catch (rollbackError) {
                console.error('Ошибка отката:', (rollbackError as Error).message);
            }
            res.status(500).json({ message: 'Ошибка создания заказа' });
        }
    }

    private static async rollbackOrderCreation(createdEntities: any) {
        // 1. Удаление транзакций (в обратном порядке)
        console.log('rollbackOrderCreation - Откат всех операций');
        if (createdEntities.transactions?.length) {
            await TransactionModel.deleteMany({
                _id: { $in: createdEntities.transactions.map((t: any) => t._id) }
            });
        }

        // 2. Восстановление остатков
        if (createdEntities.inventoryUpdates?.length) {
            for (const update of createdEntities.inventoryUpdates) {
                await InventoryModel.updateOne(
                    { batchId: update.batchId, warehouseId: update.warehouseId },
                    { $set: { quantityAvailable: update.quantity } }
                );
            }
        }

        // 3. Удаление позиций заказа
        if (createdEntities.orderDetails?.length) {
            await OrderDetailsModel.deleteMany({
                _id: { $in: createdEntities.orderDetails.map((d: any) => d._id) }
            });
        }

        // 4. Удаление заказа
        if (createdEntities.order) {
            await OrderModel.deleteOne({ _id: createdEntities.order._id });
        }
    }

    private static async getCurrentInventory(batchId: string, warehouseId: string) {
        const inventory = await InventoryModel.findOne({ batchId, warehouseId });
        return inventory?.quantityAvailable || 0;
    }
    /**
     * Получение заказа order & orderDetails по order._id
     */
    static async getOrderById(req: Request, res: Response) {
        try {
            const order = await OrderModel.findById(req.params.id)
                .populate('customerId supplierId warehouseId');

            if (!order) {
                res.status(404).json({ error: 'Заказ не найден' });
                return
            }

            const details = await OrderDetailsModel.find({ orderId: order._id })
                .populate('productId batchId');

            res.json({ order, details });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    static async updateOrderStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const order = await OrderModel.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );
            res.json(order);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
}