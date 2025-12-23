import {
    IAddress,
    ICustomer,
    IDeliveryDoc,
    IDeliveryItem,
    IDocOrderOut,
} from "../../../interfaces";
import { DeliveryDocDTO, DeliveryDto, DeliveryItemsDTO } from "../../../interfaces/DTO";
import {
    AddressModel,
    CustomerModel,
    DeliveryDocModel,
    DeliveryItemModel,
    DocModel,
} from "../models";
import { StatusService } from "../services";
import { Types } from "mongoose";

interface newDelivery {
    date: Date;
    startTime: string;
    unloadTime: string;
    timeInProgress: string;
    totalCountEntity: number;
    totalCountDoc: number;
    totalSum: number;
    docIds: String[];
}

export class DeliveryService {
    static async createDelivery(data: newDelivery) {
        const docs: IDocOrderOut[] = await DocModel.find({
            _id: { $in: data.docIds },
        });

        if (docs.length === 0) {
            throw new Error("Не найдено ни одного документа по указанным ID");
        }

        if (docs.length !== data.docIds.length) {
            throw new Error("Документов по указанным ID не существует");
        }

        const newDeliveryDoc: IDeliveryDoc = {
            date: new Date(data.date),
            startTime: new Date(data.startTime),
            unloadTime: new Date(data.unloadTime),
            timeInProgress: new Date(data.timeInProgress),
            creatorId: docs[0].userId.toString(),
            totalCountEntity: docs.reduce(
                (acc, curr) => acc + curr.itemCount,
                0
            ),
            totalCountDoc: docs.length,
            totalSum: docs.reduce((acc, curr) => acc + curr.summ, 0),
        };

        const deliveryDoc = await DeliveryDocModel.create(newDeliveryDoc);

        const startTime = new Date(data.startTime).getTime();
        const timeInProgress = new Date(data.timeInProgress).getTime();
        const unloadTime = new Date(data.unloadTime).getTime();

        let currentTime = startTime;

        const newDeliveryItems: IDeliveryItem[] = docs.map((doc) => {
            const deliveryItem = {
                deliveryId: deliveryDoc._id ? deliveryDoc._id.toString() : "",
                docIds: [doc._id?.toString() || ""], // превращаем строку в массив
                addressId: doc.addressId ? doc.addressId.toString() : "",
                customerId: doc.customerId ? doc.customerId.toString() : "",
                entityCount: doc.itemCount,
                summ: doc.summ,
            };

            return deliveryItem;
        });

        const groupedItems = newDeliveryItems.reduce<
            Record<string, IDeliveryItem>
        >((acc, item) => {
            const { addressId } = item;

            if (!acc[addressId]) {
                // Первый элемент для этого addressId
                acc[addressId] = {
                    ...item,
                };
            } else {
                // Уже есть — агрегируем
                acc[addressId].entityCount += item.entityCount;
                acc[addressId].summ += item.summ;
                acc[addressId].docIds.push(...item.docIds); // безопасно, т.к. мы контролируем структуру
            }
            acc[addressId].dTimePlan = new Date(
                currentTime + new Date(timeInProgress).getMinutes() * 60 * 1000
            );
            currentTime += new Date(unloadTime).getMinutes() * 60 * 1000;
            return acc;
        }, {});

        const deliveryGroupedItems: IDeliveryItem[] =
            Object.values(groupedItems);
        await DeliveryItemModel.create(deliveryGroupedItems);
        const DeliveryDto: DeliveryDto | null = await this.getDeliveryForId(
            deliveryDoc._id.toString()
        );
        console.log(DeliveryDto);

        return DeliveryDto;
    }
    static async getDocDeliveries(
        dateStart: Date,
        dateEnd: Date
    ): Promise<DeliveryDto[]> {
        // 1. Получаем документы доставки
        const deliveries = await DeliveryDocModel.find({
            date: {
                $gte: dateStart.toISOString().slice(0, 10),
                $lte: dateEnd.toISOString().slice(0, 10),
            },
        }).lean();

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
                    totalCountDoc: delivery.totalCountDoc,
                    // creatorId исключён — по определению DeliveryDocDTO
                };

                // Получаем элементы с populate
                const items = await DeliveryItemModel.find({
                    deliveryId: delivery._id,
                })
                    .populate("addressId")
                    .populate("customerId")
                    .lean();

                // Преобразуем каждый item в DeliveryItemsDTO
                const deliveryItems: DeliveryItemsDTO[] = items.map((item) => {
                    // Безопасная проверка populated полей
                    const address =
                        item.addressId &&
                        !(item.addressId instanceof Types.ObjectId)
                            ? (item.addressId as unknown as IAddress)
                            : null;
                    const customer =
                        item.customerId &&
                        !(item.customerId instanceof Types.ObjectId)
                            ? (item.customerId as unknown as ICustomer)
                            : null;

                    return {
                        _id: item._id.toString(),
                        docIds: (Array.isArray(item.docIds)
                            ? item.docIds
                            : []
                        ).map((id) => id.toString()),
                        summ: item.summ,
                        entityCount: item.entityCount,
                        dTimePlan: item.dTimePlan
                            ? new Date(item.dTimePlan)
                            : new Date(),
                        dTimeFact: item.dTimeFact
                            ? new Date(item.dTimeFact)
                            : undefined,

                        // Вложенные DTO
                        addressId: {
                            _id: address?._id?.toString() || "",
                            address: address?.address || "",
                            gps: address?.gps || "",
                        },
                        customerId: {
                            _id: customer?._id?.toString() || "",
                            name: customer?.name || "",
                            phone: customer?.phone || "",
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
    static async getDeliveryForId(
        deliveryId: string
    ): Promise<DeliveryDto | null> {
        if (!deliveryId || !Types.ObjectId.isValid(deliveryId)) {
            return null;
        }

        try {
            // 1. Получаем документ доставки
            const deliveryDoc = await DeliveryDocModel.findOne({
                _id: deliveryId,
            }).lean();

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
                timeInProgress: deliveryDoc.timeInProgress,
                // creatorId исключён из DTO — по определению Omit<IDeliveryDoc, 'creatorId'>
            };

            // 2. Получаем элементы доставки с populate
            const items = await DeliveryItemModel.find({
                deliveryId: deliveryDoc._id,
            })
                .sort({ dTimePlan: 1 })
                .populate({
                    path: "addressId",
                    select: "_id address gps", // только нужные поля
                    model: AddressModel,
                })
                .populate({
                    path: "customerId",
                    select: "_id name phone", // только нужные поля (без address, gps — их нет в ICustomerDTO)
                    model: CustomerModel,
                })
                .lean();

            // 3. Преобразуем в DeliveryItemsDTO
            const deliveryItems: DeliveryItemsDTO[] = items.map((item) => {
                const address =
                    item.addressId && typeof item.addressId === "object"
                        ? (item.addressId as unknown as IAddress)
                        : null;
                const customer =
                    item.customerId && typeof item.customerId === "object"
                        ? (item.customerId as unknown as ICustomer)
                        : null;

                return {
                    _id: item._id.toString(),
                    docIds: Array.isArray(item.docIds)
                        ? item.docIds.map((id) => id.toString())
                        : [item.docIds].filter(Boolean),
                    summ: item.summ,
                    entityCount: item.entityCount,
                    dTimePlan: item.dTimePlan
                        ? new Date(item.dTimePlan)
                        : new Date(), // или null, если допустимо
                    dTimeFact: item.dTimeFact
                        ? new Date(item.dTimeFact)
                        : undefined,

                    // Вложенные объекты из populate
                    addressId: {
                        _id: address ? address._id?.toString() || "" : "",
                        address: address ? address.address || "" : "",
                        gps: address ? address.gps || "" : "",
                    },
                    customerId: {
                        _id: customer ? customer._id?.toString() || "" : "",
                        name: customer ? customer.name || "" : "",
                        phone: customer ? customer.phone || "" : "",
                    },
                    // sum — alias для summ (по твоему интерфейсу)
                    sum: item.summ,
                };
            });

            return { deliveryDoc: deliveryDocDto, deliveryItems };
        } catch (error) {
            console.error("Ошибка при получении доставки по ID:", error);
            return null;
        }
    }
    static async updateDelivery(
        deliveryId: string,
        data: any,
        userId: string | undefined
    ) {
        // const deliveryDocUpdate = data.deliveryDoc;

        console.log(data);

        // Обновляем DeliveryDoc
        const deliveryDoc = await DeliveryDocModel.updateOne(
            { _id: deliveryId },
            {
                $set: {
                    ...data.deliveryDoc,
                    date: new Date(data.deliveryDoc.date),
                    startTime: new Date(data.deliveryDoc.startTime),
                    unloadTime: new Date(data.deliveryDoc.unloadTime),
                    timeInProgress: new Date(data.deliveryDoc.timeInProgress),
                },
            }
        );

        // Обновляем каждый DeliveryItem по его _id
        const itemUpdates = data.deliveryItems.map(async (item: any) => {
            const { _id: itemId, ...itemData } = item;
            const deliveryItem = await DeliveryItemModel.updateOne(
                { _id: itemId, deliveryId: deliveryId },
                {
                    $set: {
                        ...itemData,
                        dTimePlan: new Date(itemData.dTimePlan),
                        dTimeFact: itemData.dTimeFact
                            ? new Date(itemData.dTimeFact)
                            : null,
                    },
                }
            );
            item.docIds.map((docId: string) => {
                if (itemData.dTimeFact) {
                    StatusService.updateStatus(docId, "Completed", userId);
                } else {
                    StatusService.updateStatus(docId, "InDelivery", userId);
                }
            });
            return deliveryItem;
        });

        // Ожидаем обновления всех DeliveryItem
        const deliveryItems = await Promise.all(itemUpdates);

        return { deliveryDoc, deliveryItems };
    }
}
