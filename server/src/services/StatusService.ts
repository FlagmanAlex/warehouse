// services/DocService.ts
import {
    IDocModel,
    DocModel,
    DocItemsModel,
    InventoryModel,
    TransactionModel,
    BatchModel,
    ITransactionModel,
    IAccountModel,
    AccountModel,
} from "../models";
import { InventoryService } from "./InventoryService";
import {
    DocStatusInName,
    DocStatusName,
    DocStatusOrderName,
    DocStatusOutName,
    DocStatusTransferName,
    STATUS_TRANSITIONS_INCOMING,
    STATUS_TRANSITIONS_ORDER,
    STATUS_TRANSITIONS_OUTGOING,
    STATUS_TRANSITIONS_TRANSFER,
} from "../../../interfaces/Config";
import { IDocItem } from "../../../interfaces";

type ValidStatusTransition<T extends string> = Record<T, { name: T }[]>;

export class StatusService {
    static async updateStatus(
        docId: string,
        newStatusName: DocStatusName,
        userId: string | undefined
    ): Promise<IDocModel> {
        if (!userId) throw new Error("Пользователь не авторизован");

        const doc: IDocModel | null = await DocModel.findById(docId);
        if (!doc) throw new Error("Документ не найден");

        const currentStatus = doc.docStatus;
        if (currentStatus === newStatusName) {
            console.log(`Документ ${docId} уже в статусе "${newStatusName}"`);
            return doc;
        }
        const docType = doc.docType;

        //1. Определяем какие переходы документа разрешены
        let allowedNextStatuses: string[] = [];

        if (docType === "Outgoing") {
            allowedNextStatuses =
                STATUS_TRANSITIONS_OUTGOING[
                    currentStatus as DocStatusOutName
                ] || [];
        } else if (docType === "Incoming") {
            allowedNextStatuses =
                STATUS_TRANSITIONS_INCOMING[currentStatus as DocStatusInName] ||
                [];
        } else if (docType === "Transfer") {
            allowedNextStatuses =
                STATUS_TRANSITIONS_TRANSFER[
                    currentStatus as DocStatusTransferName
                ] || [];
        } else if (docType === "OrderOut" || docType === "OrderIn") {
            allowedNextStatuses =
                STATUS_TRANSITIONS_ORDER[currentStatus as DocStatusOrderName] ||
                [];
        } else {
            throw new Error(`Неизвестный тип документа: ${docType}`);
        }

        //2. Проверяем, что новый статус разрешен
        if (!allowedNextStatuses.includes(newStatusName)) {
            throw new Error(
                `Переход из статуса "${currentStatus}" на "${newStatusName}" запрещен для документа типа "${docType}"`
            );
        }

        //3. Выполняем переход
        switch (docType) {
            case "Outgoing":
                await this.handleOutgoingStatusChange(
                    doc,
                    newStatusName,
                    userId
                );
                break;
            case "Incoming":
                await this.handleIncomingStatusChange(
                    doc,
                    newStatusName,
                    userId
                );
                break;
            case "Transfer":
                await this.handleTransferStatusChange(
                    doc,
                    newStatusName,
                    userId
                );
                break;
            case "OrderOut":
                await this.handleOrderOutStatusChange(
                    doc,
                    newStatusName,
                    userId
                );
                break;
            case "OrderIn":
                await this.handleOrderInStatusChange(
                    doc,
                    newStatusName,
                    userId
                );
                break;
            default:
                throw new Error(`Неизвестный тип документа: ${docType}`);
        }

        await doc.save();
        return doc;
    }

    private static async handleOutgoingStatusChange(
        doc: IDocModel,
        newStatusName: DocStatusName,
        userId: string
    ) {
        console.log("handleOutgoingStatusChange", doc, newStatusName, userId);
        // Логика обработки изменения статуса для исходящих документов
        doc.docStatus = newStatusName;
    }

    private static async handleIncomingStatusChange(
        doc: IDocModel,
        newStatusName: DocStatusName,
        userId: string
    ) {
        console.log("handleIncomingStatusChange", doc, newStatusName, userId);
        // Логика обработки изменения статуса для входящих документов
        doc.docStatus = newStatusName;
    }

    private static async handleTransferStatusChange(
        doc: IDocModel,
        newStatusName: DocStatusName,
        userId: string
    ) {
        console.log("handleTransferStatusChange", doc, newStatusName, userId);
        // Логика обработки изменения статуса для переводов документов
        doc.docStatus = newStatusName;
    }

    private static async handleOrderOutStatusChange(
        doc: IDocModel,
        newStatusName: DocStatusName,
        userId: string
    ) {
        console.log("handleOrderOutStatusChange", doc, newStatusName, userId);
        // Логика обработки изменения статуса для исходящих заказов
        doc.docStatus = newStatusName;
    }

    private static async handleOrderInStatusChange(
        doc: IDocModel,
        newStatusName: DocStatusName,
        userId: string
    ) {
        console.log("handleOrderInStatusChange", doc, newStatusName, userId);
        // Логика обработки изменения статуса для входящих заказов
        doc.docStatus = newStatusName;
    }
    static async completeDocIn(docId: string): Promise<IDocModel> {
        const doc: IDocModel | null = await DocModel.findById(docId);
        if (!doc) throw new Error("Документ не найден");
        if (doc.docType !== "Incoming")
            throw new Error("Только приходные документы могут быть завершены");

        // Логика завершения документа
        doc.docStatus = "Completed";
        return await doc.save();
    }

    /**
     * === Резервирование товаров (переход в "В резерве") ===
     * Проверяет наличие, но не списывает — только меняет статус.
     */
    private static async reserveItems(docId: string): Promise<IDocModel> {
        const doc: IDocModel | null = await DocModel.findById(docId);
        if (!doc) throw new Error("Документ не найден");
        if (doc.docStatus !== "Draft")
            throw new Error(
                'Резервировать можно только документ в статусе "Draft"'
            );
        if (doc.docType !== "Outgoing")
            throw new Error(
                'Резервирование доступно только для документов типа "Outgoing"'
            );

        const items: IDocItem[] = await DocItemsModel.find({ docId: doc._id });

        for (const item of items) {
            await InventoryService.reserve(
                item.productId.toString(),
                item.quantity
            );
        }

        // Если всё ок — меняем статус
        doc.docStatus = "Reserved";
        return await doc.save();
    }

    static async shipItemsOut(docId: string, userId: string): Promise<void> {
        // 1. Найти документ и его позиции
        const doc = await DocModel.findById(docId).populate<{
            items: IDocItem[];
        }>("items");
        if (!doc) throw new Error("Документ не найден");
        if (doc.docType !== "Outgoing")
            throw new Error("Только расходные документы могут быть отгружены");

        const items = doc.items;
        if (!items || items.length === 0)
            throw new Error("Нет позиций в документе");

        // 2. Собрать все инвентарные записи по продуктам и партиям
        const promises = items.map(async (item) => {
            const { productId, quantity, batchId } = item;

            // Найти инвентарную запись по продукту и (опционально) партии
            const query: any = { productId, warehouseId: doc.warehouseId };
            if (batchId) query.batchId = batchId;

            const inventory = await InventoryModel.findOne(query);
            if (!inventory)
                throw new Error(
                    `Инвентарная запись для продукта ${productId} не найдена`
                );

            // Проверить, достаточно ли зарезервированного количества
            if (inventory.quantityReserved < quantity) {
                throw new Error(
                    `Недостаточно зарезервированного количества для товара ${productId}`
                );
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
                previousQuantity:
                    inventory.quantityAvailable +
                    inventory.quantityReserved +
                    quantity, // до списания
                changedQuantity: -quantity, // списание
                docId,
                userId,
                transactionDate: new Date(),
            });
            await transaction.save();

            // 5. Если нужно — создать финансовую запись (например, продажа покупателю)
            // Допустим: при отгрузке Outgoing → списываем с баланса покупателя (если это не предоплата)
            if (doc.customerId) {
                const amount = quantity * item.unitPrice; // сумма списания

                // Получаем последний баланс
                const lastAccount: IAccountModel | null =
                    await AccountModel.findOne({
                        entityId: doc.customerId,
                    }).sort({ createdAt: -1 });

                const newBalance = (lastAccount?.balanceAfter || 0) - amount;

                const account: IAccountModel = new AccountModel({
                    entityType: "customer",
                    entityId: doc.customerId,
                    amount: -amount, // расход
                    balanceAfter: newBalance,
                    refType: "order",
                    refId: docId,
                    userId,
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
        if (!doc) throw new Error("Документ не найден");
        if (doc.docStatus !== "Shipped")
            throw new Error(
                'Завершить можно только документ в статусе "Shipped"'
            );

        doc.docStatus = "Completed";
        return await doc.save();
    }

    /**
     * === Отмена документа (переход в "Отменен") ===
     * Отменяет все эффекты в зависимости от текущего статуса.
     */
    static async cancelDoc(docId: string): Promise<IDocModel> {
        const doc = await DocModel.findById(docId);
        if (!doc) throw new Error("Документ не найден");
        if (doc.docStatus === "Canceled")
            throw new Error("Документ уже отменён");

        if (doc.docStatus === "Reserved") {
            // Резерв ещё не списан — просто меняем статус
            doc.docStatus = "Canceled";
            return await doc.save();
        }

        if (doc.docStatus === "Shipped" || doc.docStatus === "Completed") {
            // Нужно распровести (вернуть товары)
            await this.reverseTransactions(docId);
            await this.cleanupBatches(docId);

            doc.docStatus = "Canceled";
            return await doc.save();
        }

        if (doc.docStatus === "Draft") {
            doc.docStatus = "Canceled";
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
        const transactions = await TransactionModel.find({
            docId,
            transactionType: "Приход",
        });
        for (const tx of transactions) {
            const count = await TransactionModel.countDocuments({
                batchId: tx.batchId,
                docId: { $ne: docId },
            });
            if (count === 0) {
                await BatchModel.deleteOne({ _id: tx.batchId });
            }
        }
    }

    /**
     * === Получение доступного количества товара на складе ===
     */
    private static async getAvailableInventory(
        productId: string,
        warehouseId: string
    ): Promise<number> {
        const inventories = await InventoryModel.find({
            productId,
            warehouseId,
        });
        return inventories.reduce((sum, inv) => sum + inv.quantityAvailable, 0);
    }

    /**
     * === Получение зарезервированного количества товара ===
     * Считаем по всем документам в статусе "В резерве"
     */
    private static async getReservedInventory(
        productId: string,
        warehouseId: string
    ): Promise<number> {
        const reservedDocs = await DocModel.find({
            docType: "Outgoing",
            status: "Reserved",
            warehouseId,
        });

        if (reservedDocs.length === 0) return 0;

        const reservedItems = await DocItemsModel.find({
            docId: { $in: reservedDocs.map((d) => d._id) },
            productId,
        });

        return reservedItems.reduce((sum, item) => sum + item.quantity, 0);
    }
}
