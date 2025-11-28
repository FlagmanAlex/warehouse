import { IAddress, ICustomer, IDeliveryDoc, IDeliveryItem, IDocOrderOut } from "@interfaces";
import { DeliveryDocDTO, DeliveryDto, DeliveryItemsDTO } from "@interfaces/DTO";
import { AddressModel, CustomerModel, DeliveryDocModel, DeliveryItemModel, DocModel, IDeliveryDocModel } from "@models";
import { Types } from "mongoose";

interface newDelivery {
    date: Date,
    startTime: string
    unloadTime: string,
    timeInProgress: string,
    docIds: String[]
}


export class DeliveryService {
    private static readonly stringToTime = (time: string) => time.split(':').map(Number).reduce((acc, curr) => acc * 60 + curr, 0) * 60 * 1000
    static async createDelivery(data: newDelivery) {

        const startTime = new Date(data.date).getTime() + this.stringToTime(data.startTime)
        const timeInProgress = new Date(data.date).getTime() + this.stringToTime(data.timeInProgress)
        const unloadTime = new Date(data.date).getTime() + this.stringToTime(data.unloadTime)

        console.log(startTime, timeInProgress, unloadTime);

        const docs: IDocOrderOut[] = await DocModel.find({ _id: { $in: data.docIds } })

        if (docs.length === 0) {
            throw new Error('Не найдено ни одного документа по указанным ID');
        }


        const newDeliveryDoc: IDeliveryDoc = {
            date: new Date(data.date),
            startTime: new Date(startTime),
            unloadTime: new Date(unloadTime),
            timeInProgress: new Date(timeInProgress),
            creatorId: docs[0].userId.toString(),
            totalCountEntity: docs.reduce((acc, curr) => acc + curr.itemCount, 0),
            totalCountDoc: docs.length,
            totalSum: docs.reduce((acc, curr) => acc + curr.summ, 0)
        };

        const deliveryDoc = await DeliveryDocModel.create(newDeliveryDoc);

        let currentTime = new Date(newDeliveryDoc.startTime).getTime()

        const newDeliveryItems: IDeliveryItem[] = docs.map(doc => {
            currentTime = new Date(currentTime).getTime()
            const deliveryItem = {
                deliveryId: deliveryDoc._id ? deliveryDoc._id.toString() : '',
                docIds: [doc._id?.toString() || ''], // превращаем строку в массив
                addressId: doc.addressId ? doc.addressId.toString() : '',
                customerId: doc.customerId ? doc.customerId.toString() : '',
                entityCount: doc.itemCount,
                summ: doc.summ,
                dTimePlan: new Date(currentTime)
            }

            currentTime += unloadTime;
            return deliveryItem;
        })

        const groupedItems = newDeliveryItems.reduce<Record<string, IDeliveryItem>>((acc, item) => {
            const { addressId } = item;

            if (!acc[addressId]) {
                // Первый элемент для этого addressId
                acc[addressId] = {
                    ...item
                };
            } else {
                // Уже есть — агрегируем
                acc[addressId].entityCount += item.entityCount;
                acc[addressId].summ += item.summ;
                acc[addressId].docIds.push(...item.docIds); // безопасно, т.к. мы контролируем структуру
            }

            return acc;
        }, {});

        const deliveryGroupedItems: IDeliveryItem[] = Object.values(groupedItems);
        const deliveryItems = await DeliveryItemModel.create(deliveryGroupedItems);
        return { deliveryDoc, deliveryItems };
    }
    static async getDocDeliveries(dateStart: Date, dateEnd: Date): Promise<DeliveryDto[]> {
        // 1. Получаем документы доставки
        const deliveries = await DeliveryDocModel
            .find({ date: { $gte: dateStart, $lte: dateEnd } })
            .lean();

        if (deliveries.length === 0) {
            return [];
        }

        // 2. Для каждой доставки получаем элементы с populate
        const deliveriesWithItems = await Promise.all(
            deliveries.map(async (delivery) => {
                // Преобразуем deliveryDoc в DeliveryDocDTO
                const deliveryDocDto: DeliveryDocDTO = {
                    _id: delivery._id.toString(), // _id всегда есть у сохранённого документа
                    date: delivery.date,
                    totalSum: delivery.totalSum,
                    startTime: delivery.startTime,
                    totalCountEntity: delivery.totalCountEntity,
                    totalCountDoc: delivery.totalCountDoc
                    // creatorId исключён — по определению DeliveryDocDTO
                };

                // Получаем элементы с populate
                const items = await DeliveryItemModel
                    .find({ deliveryId: delivery._id })
                    .populate('addressId')
                    .populate('customerId')
                    .lean();

                // Преобразуем каждый item в DeliveryItemsDTO
                const deliveryItems: DeliveryItemsDTO[] = items.map(item => {
                    // Безопасная проверка populated полей
                    const address =
                        item.addressId && !(item.addressId instanceof Types.ObjectId)
                            ? item.addressId as unknown as IAddress
                            : null;
                    const customer =
                        item.customerId && !(item.customerId instanceof Types.ObjectId)
                            ? item.customerId as unknown as ICustomer
                            : null;

                    return {
                        _id: item._id.toString(),
                        docIds: (Array.isArray(item.docIds) ? item.docIds : []).map(id => id.toString()),
                        summ: item.summ,
                        entityCount: item.entityCount,
                        dTimePlan: item.dTimePlan ? new Date(item.dTimePlan) : new Date(),
                        dTimeFact: item.dTimeFact ? new Date(item.dTimeFact) : undefined,

                        // Вложенные DTO
                        addressId: {
                            _id: address?._id?.toString() || '',
                            address: address?.address || '',
                            gps: address?.gps || '',
                        },
                        customerId: {
                            _id: customer?._id?.toString() || '',
                            name: customer?.name || '',
                            phone: customer?.phone || '',
                        },
                        // Алиас для совместимости
                        sum: item.summ,
                    };
                });

                return {
                    deliveryDoc: deliveryDocDto,
                    deliveryItems,
                };
            })
        );

        return deliveriesWithItems;
    }
    static async deleteDelivery(deliveryId: string) {
        await DeliveryDocModel.deleteOne({ _id: deliveryId });
        await DeliveryItemModel.deleteMany({ deliveryId: deliveryId });
    }
    static async getDeliveryForId(deliveryId: string): Promise<DeliveryDto | null> {
        if (!deliveryId || !Types.ObjectId.isValid(deliveryId)) {
            return null;
        }

        try {
            // 1. Получаем документ доставки
            const deliveryDoc = await DeliveryDocModel
                .findOne({ _id: deliveryId })
                .lean();

            if (!deliveryDoc) {
                return null;
            }

            const deliveryDocDto: DeliveryDocDTO = {
                _id: deliveryDoc._id.toString(),
                date: deliveryDoc.date,
                totalCountDoc: deliveryDoc.totalCountDoc,
                totalCountEntity: deliveryDoc.totalCountEntity,
                totalSum: deliveryDoc.totalSum,
                startTime: deliveryDoc.startTime,
                unloadTime: deliveryDoc.unloadTime,
                // creatorId исключён из DTO — по определению Omit<IDeliveryDoc, 'creatorId'>
            };

            // 2. Получаем элементы доставки с populate
            const items = await DeliveryItemModel
                .find({ deliveryId: deliveryDoc._id })
                .populate({
                    path: 'addressId',
                    select: '_id address gps', // только нужные поля
                    model: AddressModel,
                })
                .populate({
                    path: 'customerId',
                    select: '_id name phone', // только нужные поля (без address, gps — их нет в ICustomerDTO)
                    model: CustomerModel,
                })
                .lean();

            // 3. Преобразуем в DeliveryItemsDTO
            const deliveryItems: DeliveryItemsDTO[] = items.map(item => {

                const address =
                    item.addressId &&
                        typeof item.addressId === 'object' ?
                        item.addressId as unknown as IAddress : null;
                const customer =
                    item.customerId &&
                        typeof item.customerId === 'object' ?
                        item.customerId as unknown as ICustomer : null;

                return {
                    _id: item._id.toString(),
                    docIds: Array.isArray(item.docIds)
                        ? item.docIds.map(id => id.toString())
                        : [item.docIds].filter(Boolean),
                    summ: item.summ,
                    entityCount: item.entityCount,
                    dTimePlan: item.dTimePlan ? new Date(item.dTimePlan) : new Date(), // или null, если допустимо
                    dTimeFact: item.dTimeFact ? new Date(item.dTimeFact) : undefined,

                    // Вложенные объекты из populate
                    addressId: {
                        _id: address ? address._id?.toString() || '' : '',
                        address: address ? address.address || '' : '',
                        gps: address ? address.gps || '' : '',
                    },
                    customerId: {
                        _id: customer ? customer._id?.toString() || '' : '',
                        name: customer ? customer.name || '' : '',
                        phone: customer ? customer.phone || '' : '',
                    },
                    // sum — alias для summ (по твоему интерфейсу)
                    sum: item.summ,
                };
            });

            return { deliveryDoc: deliveryDocDto, deliveryItems };
        } catch (error) {
            console.error('Ошибка при получении доставки по ID:', error);
            return null;
        }
    }
}
