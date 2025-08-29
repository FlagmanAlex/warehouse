// services/OrderService.ts

import { 
    IOrderModel, 
  OrderModel, 
  OrderItemModel, 
  IOrderItemModel,
  ProductModel,
  InventoryModel,
  DocModel,
  DocItemsModel
} from '@models';

// import { CreateOrderDto, } from '@interfaces/DTO';
import { IInventory, IPopulatedInventory, IPopulatedOrder, IPopulatedOrderItem, IPopulatedProductInventory, IProduct } from '@interfaces';
import mongoose from 'mongoose';


type PopulateInventoryDoc = mongoose.Document & IPopulatedInventory;
type PopulateOrderItemDoc = mongoose.Document & IPopulatedOrderItem;

export class OrderService {
  /**
   * Создание заказа
   */
  // static async createOrder(dto: CreateOrderDto): Promise<IOrderModel> {
  //   const order = await OrderModel.create({
  //     ...dto,
  //     orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
  //     status: 'Новый',
  //     totalAmount: 0,
  //     totalQuantity: 0
  //   });

  //   const items: IOrderItemModel[] = [];

  //   let totalQuantity = 0;
  //   let totalAmount = 0;

  //   for (const item of dto.items) {
  //     const product = await ProductModel.findById(item.productId);
  //     if (!product) throw new Error(`Товар не найден: ${item.productId}`);

  //     const fulfilledQuantity = 0;

  //     const orderItem = await OrderItemModel.create({
  //       orderId: order._id,
  //       productId: item.productId,
  //       requestedQuantity: item.requestedQuantity,
  //       fulfilledQuantity,
  //       unitPrice: item.unitPrice,
  //       preferredWarehouseId: item.preferredWarehouseId
  //     });

  //     items.push(orderItem);

  //     totalQuantity += item.requestedQuantity;
  //     totalAmount += item.requestedQuantity * item.unitPrice;
  //   }

  //   order.totalQuantity = totalQuantity;
  //   order.totalAmount = totalAmount;
  //   await order.save();

  //   return order;
  // }

  /**
   * Получение заказа с позициями
   */
  static async getOrderById(orderId: string): Promise< IPopulatedOrder | null> {
    return await OrderModel.findById(orderId)
      .populate('customerId', 'name')
      .populate('userId', 'username')
      .exec() as unknown as IPopulatedOrder
    }

  /**
   * Получение всех заказов
   */
  static async getAllOrders() {
    return await OrderModel.find()
      .populate('customerId', 'name')
      .populate('userId', 'username')
      .sort({ orderDate: -1 });
  }

  /**
   * Получение позиций заказа
   */
  static async getOrderItems(orderId: string): Promise<IPopulatedOrderItem[]> {
    return await OrderItemModel.find({ orderId })
      .populate('productId', 'name article unitOfMeasurement')
      .populate('preferredWarehouseId', 'name')
      .exec() as unknown as IPopulatedOrderItem[];
  }

  /**
   * Обновление статуса заказа
   */
  static async updateOrderStatus(orderId: string, status: string) {
    const validStatuses: string[] = ['Новый', 'Формируется', 'Частично собран', 'Собран', 'Отгружен', 'Отменён'];
    if (!validStatuses.includes(status)) {
      throw new Error('Некорректный статус');
    }

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) throw new Error('Заказ не найден');

    return order;
  }

  /**
   * Получение информации по остаткам товара для UI
   */
  static async getProductInventory(productId: string): Promise<IPopulatedProductInventory> {
    const product: IProduct | null = await ProductModel.findById(productId);
    if (!product) throw new Error('Товар не найден');

    const inventories: PopulateInventoryDoc[] = await InventoryModel.find({ productId })
      .populate('batchId', 'expirationDate')
      .populate('warehouseId', 'name')
      .exec() as any

    const inventoryByWarehouse = inventories.map(inv => ({
      warehouseId: inv.warehouseId._id.toString(),
      warehouseName: inv.warehouseId.name,
      quantityAvailable: inv.quantityAvailable,
      batchId: inv.batchId?._id,
      expirationDate: inv.batchId?.expirationDate
    }));

    const defaultWarehouseStock = 
      inventoryByWarehouse.find(i => i.warehouseId === product.defaultWarehouseId)?.quantityAvailable || 0;

      const defaultWarehouse = inventories.find(i => i.warehouseId.toString() === product.defaultWarehouseId);

    return {
      productId: product._id || '',
      productName: product.name,
      article: product.article,
      unitOfMeasurement: product.unitOfMeasurement,
      inventoryByWarehouse,
      defaultWarehouseStock,
      defaultWarehouseId: product.defaultWarehouseId,
      defaultWarehouseName: inventoryByWarehouse.find(i => i.warehouseId === product.defaultWarehouseId)?.warehouseName || 'Не указан'
    };
  }

  /**
   * Формирование документов списания (Расход) на основе заказа
   */
  static async createFulfillmentDocs(orderId: string): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Заказ не найден');

    const items = await OrderItemModel.find({ orderId })
      .populate('productId', 'name article defaultWarehouseId')
      .exec() as unknown as IPopulatedOrderItem[];

    // Группируем позиции по складу
    const allocations: Record<string, { item: IPopulatedOrderItem; allocate: number }[]> = {};

    if (!items) throw new Error('Нет позиций в заказе');

    for (const item of items) {
      const productId = item.productId._id.toString();
      const remaining = item.requestedQuantity - item.fulfilledQuantity;

      if (remaining <= 0) continue;

      // Определяем приоритетный склад
      const preferredWh = item.preferredWarehouseId || item.productId.defaultWarehouseId;

      // Проверяем остаток на приоритетном складе
      const inv = await InventoryModel.findOne({
        productId,
        warehouseId: preferredWh,
        quantityAvailable: { $gt: 0 }
      });

      const available = inv?.quantityAvailable || 0;
      const allocate = Math.min(available, remaining);

      if (allocate > 0) {
        allocations[preferredWh] = allocations[preferredWh] || [];
        allocations[preferredWh].push({ item, allocate });
      }

      // Если не хватило — ищем на других складах (FIFO)
      if (allocate < remaining) {
        const remainingQty = remaining - allocate;
        const otherInvs = await InventoryModel.find({
          productId,
          warehouseId: { $ne: preferredWh },
          quantityAvailable: { $gt: 0 }
        }).sort({ createdAt: 1 });

        let left = remainingQty;
        for (const otherInv of otherInvs) {
          const take = Math.min(otherInv.quantityAvailable, left);
          allocations[otherInv.warehouseId.toString()] = allocations[otherInv.warehouseId.toString()] || [];
          allocations[otherInv.warehouseId.toString()].push({ item, allocate: take });
          left -= take;
          if (left <= 0) break;
        }
      }
    }

    // Создаём документы списания
    for (const warehouseId in allocations) {
      const itemsToShip = allocations[warehouseId];

      const doc = await DocModel.create({
        docType: 'Расход',
        docDate: new Date(),
        orderId,
        customerId: order.customerId,
        warehouseId,
        userId: order.userId,
        status: 'Черновик',
        orderNum: order.orderNum,
        totalAmount: itemsToShip.reduce((sum, i) => sum + i.allocate * i.item.unitPrice, 0)
      });

      const docItems = itemsToShip.map(i => ({
        docId: doc._id,
        productId: i.item.productId,
        quantity: i.allocate,
        unitPrice: i.item.unitPrice
      }));

      await DocItemsModel.insertMany(docItems);

      // Обновляем fulfilledQuantity
      for (const { item, allocate } of itemsToShip) {
        await OrderItemModel.findByIdAndUpdate(item._id, {
          $inc: { fulfilledQuantity: allocate }
        });
      }
    }

    // Обновляем статус заказа
    await this.updateOrderFulfillmentStatus(orderId);
  }

  /**
   * Обновление статуса заказа на основе собранности
   */
  static async updateOrderFulfillmentStatus(orderId: string) {
    const items = await OrderItemModel.find({ orderId });
    const total = items.reduce((sum, i) => sum + i.requestedQuantity, 0);
    const fulfilled = items.reduce((sum, i) => sum + i.fulfilledQuantity, 0);

    let status: StatusOrder;
    if (fulfilled === 0) status = 'Новый';
    else if (fulfilled < total) status = 'Частично собран';
    else status = 'Собран';

    await OrderModel.findByIdAndUpdate(orderId, { status });
  }
}