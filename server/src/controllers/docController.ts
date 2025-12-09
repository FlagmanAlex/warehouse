// controllers/DocController.ts

import { Request, Response } from 'express';
// import { CreateDocDto,  } from '@interfaces/DTO';
import { DocModel, DocItemsModel, DocNumModel, IDocModel } from '@models';
import { DocService } from '../services/StatusService';
import { DocItemService } from '@services';
import { IDoc, IDocItem } from '@interfaces';
import { DocStatusName } from '@interfaces/config';

// === Дополнительный DTO для обновления статуса (может быть вынесен в DTO)

export class DocController {
    // === Создание документа (только черновик) ===
    static async createDoc(req: Request<{}, {}, { doc: IDoc, items: any[] }>, res: Response) {
        const { doc, items } = req.body;
        console.log("doc", doc);


        const cleanItems = items.map((item) => {
            const { _id, ...rest } = item;
            if (item._id && item._id.startsWith('temp_')) {
                return { ...rest };
            }
            return item;
        });

        try {
            // Генерация номера
            const prefixMap: Record<string, string> = { OrderOut: 'ЗК', OrderIn: 'ЗП', Incoming: 'ПР', Outgoing: 'РС', Transfer: 'ПМ' };
            const prefix = prefixMap[doc.docType];
            if (!prefix) {
                res.status(400).json({ error: 'Неверный тип документа' });
                return
            }

            const sequence = await DocNumModel.findByIdAndUpdate(
                prefix,
                { $inc: { nextNumber: 1 } },
                { upsert: true, new: true }
            );

            const docNum = `${prefix}${String(sequence.nextNumber).padStart(6, '0')}`;

            // console.log('Создан новый документ:', { ...doc, docNum });

            // Создание документа
            const newDoc = await DocModel.create({
                ...doc,
                docNum,
                userId: req.userId
            });

            // Создание позиций
            if (cleanItems.length > 0) {
                const newItems = cleanItems.map((item) => ({ ...item, docId: newDoc._id }));
                await newItems.forEach((item) => DocItemService.create(item));
                res.status(201).json({ doc: newDoc, items: newItems });
            } else {
                res.status(201).json({ doc: newDoc, items: [] });
            }
            // await DocItemsModel.insertMany(newItems);

        } catch (error: any) {
            console.error('Ошибка при создании документа:', error);
            console.log(doc, items);

            res.status(500).json({ error: error.message });
        }
    }

    static async updateDoc(req: Request<{ id: string }, {}, { doc: IDoc, items: IDocItem[] }>, res: Response) {
        const { id } = req.params;
        const { doc, items } = req.body;

        try {
            // 1. Обновляем сам документ
            const updatedDoc = await DocModel.findByIdAndUpdate(id, doc, { new: true });
            // console.log(' Обновленный документ:',updatedDoc);


            if (!updatedDoc) {
                res.status(404).json({ error: 'Документ не найден' });
                return
            }

            // 2. Удаляем ВСЕ старые позиции
            await DocItemsModel.deleteMany({ docId: id });
            // console.log('Удалены старые позиции документа:', id);
            
            // 3. Создаём НОВЫЕ позиции
            if (items && items.length > 0) {
                const itemsWithDocId = items.map(item => ({
                    ...item,
                    docId: id, // гарантируем, что docId установлен
                }));

                // console.log('Созданы новые позиции документа:', itemsWithDocId);
                /**
                 * Можно использовать Promise.all, но в данном случае лучше использовать
                 * forEach, чтобы обрабатывать каждую позицию в цикле.
                 */
                itemsWithDocId.forEach((item) => { DocItemService.create(item) });
                // console.log('Позиции добавлены в базу:', itemsWithDocId);


                // 4. Отправляем ответ
                res.json({
                    doc: updatedDoc,
                    items: itemsWithDocId, // или createdItems, если нужно вернуть сгенерированные _id
                });
            } else {
                res.json({
                    doc: updatedDoc,
                    items: [], // или createdItems, если нужно вернуть сгенерированные _id
                });
            }
        } catch (error: any) {
            console.error('Ошибка при обновлении документа:', error);
            res.status(500).json({ error: error.message });
        }
    }


    // === Получение всех документов ===
    static async getAllDocs(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            const filter: any = {};

            if (startDate && endDate) {
                filter.docDate = {
                    $gte: new Date(startDate as string),
                    $lte: new Date(endDate as string)
                };
            }

            const docs = await DocModel.find(filter)
                .populate('supplierId warehouseId customerId userId addressId')
                // .populate('customerId', 'name phone')
                // .populate('userId', 'username')
                .sort({ docDate: 1 });

            res.json(docs);
        } catch (error: any) {
            console.error('Ошибка при получении документов:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // === Получение документа по ID ===
    static async getDocById(req: Request, res: Response) {
        try {
            const doc = await DocModel.findById(req.params.id)
                .populate('customerId supplierId warehouseId addressId userId');

            if (!doc) {
                res.status(404).json({ error: 'Документ не найден' });
                return
            }

            const items = await DocItemsModel.find({ docId: doc._id })
                .populate('batchId')
                .populate({
                    path: 'productId',
                    populate: {
                        path: 'categoryId',
                    }
                })


            res.json({ doc, items });
        } catch (error: any) {
            console.error('Ошибка при получении документа:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // === Обновление статуса документа (основное изменение!) ===
    static async updateDocStatus(req: Request<{ id: string }, {}, { status: DocStatusName }>, res: Response) {
        const { id } = req.params;
        const { status } = req.body;

        try {

            const doc = await DocService.updateStatus(id, status, req.userId || '');
            res.json({ success: true, doc });
            return
        } catch (error: any) {
            console.error('Ошибка при изменении статуса:', error);
            res.status(400).json({ error: error.message });
            return
        }
    }




    // === Удаление документа (только если Черновик или Отменен) ===
    static async deleteDoc(req: Request, res: Response) {
        try {
            const doc = await DocModel.findById(req.params.id);
            if (!doc) {
                res.status(404).json({ error: 'Документ не найден' });
                return;
            }

            if (doc.docStatus !== 'Draft' && doc.docStatus !== 'Canceled') {
                res.status(400).json({ error: 'Удалить можно только документ в статусе "Draft" или "Canceled"' });
                return;
            }

            await DocModel.findByIdAndDelete(req.params.id);
            await DocItemsModel.deleteMany({ docId: doc._id });

            res.json({ message: 'Документ удалён' });
        } catch (error: any) {
            console.error('Ошибка при удалении документа:', error);
            res.status(500).json({ error: error.message });
        }
    }
    static async getDocsByStatus(req: Request, res: Response) {
        try {
            const { status } = req.params;

            // Найдём все документы с заданным статусом и типом OrderOut (если нужно)
            const docs = await DocModel.find({
                docStatus: status,
                docType: 'OrderOut' // раскомментируйте, если нужно фильтровать по типу
            })
                .populate('customerId') // только имя клиента
                .lean(); // для производительности

            if (!docs.length) {
                return res.json([]);
            }

            // Получаем все docId
            const docIds = docs.map(doc => doc._id);

            // Получаем все DocItems для этих документов
            const docItems = await DocItemsModel.find({ docId: { $in: docIds } })
                .populate('productId', 'article name') // опционально: имя и артикул
                .lean();

            // Маппинг: docId -> массив позиций
            const itemsByDocId = docItems.reduce((acc, item) => {
                if (!acc[item.docId.toString()]) {
                    acc[item.docId.toString()] = [];
                }
                acc[item.docId.toString()].push(item);
                return acc;
            }, {} as Record<string, typeof docItems>);

            // Группируем документы по customerId
            const groupedByCustomer = docs.reduce((acc, doc) => {
                const customerId = doc.customerId?._id?.toString() || 'unknown';
                const customerName = (doc.customerId as any)?.name || 'Не указан';

                if (!acc[customerId]) {
                    acc[customerId] = {
                        customerId,
                        customerName,
                        docs: [],
                        totalPositions: 0,
                        totalSum: 0,
                    };
                }

                // Получаем позиции для этого документа
                const items = itemsByDocId[doc._id.toString()] || [];

                // Считаем сумму и количество для документа
                let docTotalSum = 0;
                let docTotalQty = 0;
                for (const item of items) {
                    const qty = item.quantity || 0;
                    const price = item.unitPrice || 0;
                    docTotalSum += qty * price;
                    docTotalQty += qty;
                }

                // Добавляем документ в группу
                acc[customerId].docs.push({
                    ...doc,
                    items, // добавляем позиции
                    docTotalQty,
                    docTotalSum,
                });

                // Обновляем итоги по клиенту
                acc[customerId].totalPositions += docTotalQty;
                acc[customerId].totalSum += docTotalSum;

                return acc;
            }, {} as Record<string, any>);

            // Преобразуем объект в массив
            const result = Object.values(groupedByCustomer);

            res.json(result);
        } catch (error: any) {
            console.error('Ошибка при получении документов по статусу:', error);
            res.status(500).json({ error: error.message });
        }
    }
}