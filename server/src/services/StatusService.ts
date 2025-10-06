// services/DocService.ts

import { IDocModel, DocModel, DocItemsModel, InventoryModel, TransactionModel, BatchModel, ITransactionModel, AccountModel, IAccountModel } from '@models';
import { InventoryService } from './InventoryService';
import { DocStatusInName, DocStatusName, DocStatusOutName } from '@interfaces/config';
import { IDocItem } from '@interfaces';

type ValidStatusTransition<T extends string> = Record<T, { name: T }[]>

export class DocService {


    static async updateStatus(docId: string, newStatusName: DocStatusName, userId: string): Promise<IDocModel> {

        if (!userId) throw new Error('Пользователь не авторизован');


        const doc: IDocModel | null = await DocModel.findById(docId);
        if (!doc) throw new Error('Документ не найден');

        console.log(doc.docType, doc.docStatus, newStatusName);
        if (doc.docType === 'Outgoing') {

            type Status = DocStatusOutName

            const validStatusOut: ValidStatusTransition<Status> = {
                'Draft': [{ name: 'Reserved' }, { name: 'Canceled' }],
                'Reserved': [{ name: 'Shipped' }, { name: 'Canceled' }],
                'Shipped': [{ name: 'Completed' }, { name: 'Canceled' }],
                'Completed': [{ name: 'Canceled' }],
                'Canceled': [{ name: 'Draft' }]
            };

            // Получаем текущий статус как строку
            const currentStatus = doc.docStatus as Status;
            const allowedTransitions = validStatusOut[currentStatus] || [];
            const isAllowed = allowedTransitions.some(t => t.name === newStatusName);

            if (!isAllowed) {
                throw new Error(`Переход из статуса "${currentStatus}" на "${newStatusName}" невозможен`);
            }

            //Логика по новому статусу
            switch (newStatusName) {
                case 'Reserved':
                    console.log(`Документ ${docId} переведен в статус "В резерве"`);
                    //await this.reserveItems(docId);
                    break;
                case 'Shipped':
                    console.log(`Документ ${docId} переведен в статус "Отгружен"`);
                    //await this.shipItemsOut(docId, userId);
                    break;
                case 'Completed':
                    console.log(`Документ ${docId} переведен в статус "Завершен"`);
                    //await this.completeDocOut(docId);
                    break;
                case 'Canceled':
                    console.log(`Документ ${docId} переведен в статус "Отменен"`);
                    break;
            }
            doc.docStatus = newStatusName;
        } else if (doc.docType === 'Incoming') {

            type Status = DocStatusInName

            const validStatusIn: ValidStatusTransition<Status> = {
                'Draft': [{ name: 'Shipped' }, { name: 'Canceled' }],
                'Shipped': [{ name: 'TransitHub' }, { name: 'Canceled' }],
                'TransitHub': [{ name: 'InTransitDestination' }, { name: 'Canceled' }],
                'InTransitDestination': [{ name: 'Delivered' }, { name: 'Canceled' }],
                'Delivered': [{ name: 'Canceled' }],
                'Canceled': [{ name: 'Draft' }]
            };

            // Получаем текущий статус как строку
            const currentStatus = doc.docStatus as Status;
            const allowedTransitions = validStatusIn[currentStatus] || [];
            const isAllowed = allowedTransitions.some(t => t.name === newStatusName);

            if (!isAllowed) {
                throw new Error(`Переход из статуса "${currentStatus}" на "${newStatusName}" невозможен`);
            }

            //Логика по новому статусу
            switch (newStatusName) {
                case 'Shipped':
                    console.log(`Документ ${docId} переведен в статус "Отгружен"`);
                    //await this.shipItemsIn(docId, userId);
                    break;
                case 'TransitHub':
                    console.log(`Документ ${docId} переведен в статус "В транзите (Хаб)"`);
                    //await this.inTransitHub(docId);
                    break;
                case 'InTransitDestination':
                    console.log(`Документ ${docId} переведен в статус "В транзите (Пункт назначения)"`);
                    //await this.inTransitDestination(docId);
                    break;
                case 'Delivered':
                    console.log(`Документ ${docId} переведен в статус "Доставлен"`);
                    //await this.deliverItems(docId);
                    break;
                case 'Completed':
                    console.log(`Документ ${docId} переведен в статус "Завершен"`);
                    //await this.completeDocIn(docId);
                    break;
                case 'Canceled':
                    console.log(`Документ ${docId} переведен в статус "Отменен"`);
                    break;
            }

        }

        return await doc.save();
    }

    static async completeDocIn(docId: string): Promise<IDocModel> {
        const doc: IDocModel | null = await DocModel.findById(docId);
        if (!doc) throw new Error('Документ не найден');
        if (doc.docType !== 'Incoming') throw new Error('Только приходные документы могут быть завершены');

        // Логика завершения документа
        doc.docStatus = 'Completed';
        return await doc.save();
    }




    /**
     * === Резервирование товаров (переход в "В резерве") ===
     * Проверяет наличие, но не списывает — только меняет статус.
     */
    private static async reserveItems(docId: string): Promise<IDocModel> {
        const doc: IDocModel | null = await DocModel.findById(docId);
        if (!doc) throw new Error('Документ не найден');
        if (doc.docStatus !== 'Draft') throw new Error('Резервировать можно только документ в статусе "Draft"');
        if (doc.docType !== 'Outgoing') throw new Error('Резервирование доступно только для документов типа "Outgoing"');

        const items: IDocItem[] = await DocItemsModel.find({ docId: doc._id });

        for (const item of items) {
            await InventoryService.reserve(item.productId.toString(), item.quantity);
        }

        // Если всё ок — меняем статус
        doc.docStatus = 'Reserved';
        return await doc.save();
    }



    static async shipItemsOut(docId: string, userId: string): Promise<void> {
        // 1. Найти документ и его позиции
        const doc = await DocModel.findById(docId).populate<{ items: IDocItem[] }>('items');
        if (!doc) throw new Error('Документ не найден');
        if (doc.docType !== 'Outgoing') throw new Error('Только расходные документы могут быть отгружены');

        const items = doc.items;
        if (!items || items.length === 0) throw new Error('Нет позиций в документе');

        // 2. Собрать все инвентарные записи по продуктам и партиям
        const promises = items.map(async (item) => {
            const { productId, quantity, batchId } = item;

            // Найти инвентарную запись по продукту и (опционально) партии
            const query: any = { productId, warehouseId: doc.warehouseId };
            if (batchId) query.batchId = batchId;

            const inventory = await InventoryModel.findOne(query);
            if (!inventory) throw new Error(`Инвентарная запись для продукта ${productId} не найдена`);

            // Проверить, достаточно ли зарезервированного количества
            if (inventory.quantityReserved < quantity) {
                throw new Error(`Недостаточно зарезервированного количества для товара ${productId}`);
            }

            // 3. Списать с резерва
            inventory.quantityReserved -= quantity;
            // Общее количество уменьшается (оно = quantityAvailable + quantityReserved)
            // Но мы не храним total, поэтому просто уменьшаем reserved — этого достаточно

            await inventory.save();

            // 4. Создать транзакцию списания
            const transaction: ITransactionModel = new TransactionModel({
                transactionType: doc.docType,
                productId,
                warehouseId: doc.warehouseId,
                batchId: batchId || null,
                previousQuantity: inventory.quantityAvailable + inventory.quantityReserved + quantity, // до списания
                changedQuantity: -quantity, // списание
                docId,
                userId,
                transactionDate: new Date()
            });
            await transaction.save();

            // 5. Если нужно — создать финансовую запись (например, продажа покупателю)
            // Допустим: при отгрузке Outgoing → списываем с баланса покупателя (если это не предоплата)
            if (doc.customerId) {
                const amount = quantity * item.unitPrice; // сумма списания

                // Получаем последний баланс
                const lastAccount: IAccountModel | null = await AccountModel
                    .findOne({ entityId: doc.customerId })
                    .sort({ createdAt: -1 });

                const newBalance = (lastAccount?.balanceAfter || 0) - amount;

                const account: IAccountModel = new AccountModel({
                    entityType: 'customer',
                    entityId: doc.customerId,
                    amount: -amount, // расход
                    balanceAfter: newBalance,
                    refType: 'order',
                    refId: docId,
                    userId
                });
                await account.save();
            }
        });

        // Выполняем все параллельно
        await Promise.all(promises);
    }


    /**
     * === Завершение документа (переход в "Завершен") ===
     * Просто меняет статус — все эффекты уже применены.
     */
    static async completeDocOut(docId: string): Promise<IDocModel> {
        const doc = await DocModel.findById(docId);
        if (!doc) throw new Error('Документ не найден');
        if (doc.docStatus !== 'Shipped') throw new Error('Завершить можно только документ в статусе "Shipped"');

        doc.docStatus = 'Completed';
        return await doc.save();
    }

    /**
     * === Отмена документа (переход в "Отменен") ===
     * Отменяет все эффекты в зависимости от текущего статуса.
     */
    static async cancelDoc(docId: string): Promise<IDocModel> {
        const doc = await DocModel.findById(docId);
        if (!doc) throw new Error('Документ не найден');
        if (doc.docStatus === 'Canceled') throw new Error('Документ уже отменён');

        if (doc.docStatus === 'Reserved') {
            // Резерв ещё не списан — просто меняем статус
            doc.docStatus = 'Canceled';
            return await doc.save();
        }

        if (doc.docStatus === 'Shipped' || doc.docStatus === 'Completed') {
            // Нужно распровести (вернуть товары)
            await this.reverseTransactions(docId);
            await this.cleanupBatches(docId);

            doc.docStatus = 'Canceled';
            return await doc.save();
        }

        if (doc.docStatus === 'Draft') {
            doc.docStatus = 'Canceled';
            return await doc.save();
        }

        return doc;
    }

    /**
     * === Распроведение: отмена всех транзакций ===
     * Инвертирует все транзакции по документу.
     */
    private static async reverseTransactions(docId: string) {
        const transactions = await TransactionModel.find({ docId });
        for (const tx of transactions) {
            const delta = -tx.changedQuantity;

            await InventoryModel.updateOne(
                { batchId: tx.batchId, warehouseId: tx.warehouseId },
                { $inc: { quantityAvailable: delta } }
            );
        }

        await TransactionModel.deleteMany({ docId });
    }

    /**
     * === Очистка партий, созданных этим документом ===
     * Удаляет партии, если они больше нигде не используются.
     */
    private static async cleanupBatches(docId: string) {
        const transactions = await TransactionModel.find({ docId, transactionType: 'Приход' });
        for (const tx of transactions) {
            const count = await TransactionModel.countDocuments({ batchId: tx.batchId, docId: { $ne: docId } });
            if (count === 0) {
                await BatchModel.deleteOne({ _id: tx.batchId });
            }
        }
    }

    /**
     * === Получение доступного количества товара на складе ===
     */
    private static async getAvailableInventory(productId: string, warehouseId: string): Promise<number> {
        const inventories = await InventoryModel.find({ productId, warehouseId });
        return inventories.reduce((sum, inv) => sum + inv.quantityAvailable, 0);
    }

    /**
     * === Получение зарезервированного количества товара ===
     * Считаем по всем документам в статусе "В резерве"
     */
    private static async getReservedInventory(productId: string, warehouseId: string): Promise<number> {
        const reservedDocs = await DocModel.find({
            docType: 'Outgoing',
            status: 'Reserved',
            warehouseId
        });

        if (reservedDocs.length === 0) return 0;

        const reservedItems = await DocItemsModel.find({
            docId: { $in: reservedDocs.map(d => d._id) },
            productId
        });

        return reservedItems.reduce((sum, item) => sum + item.quantity, 0);
    }
}