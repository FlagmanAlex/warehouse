import { ICategory } from '../ICategory';
import { IDoc, IDocIncoming, IDocOrder, IDocTransfer } from '../IDoc';
import { IDocItem } from '../IDocItem'
import { IProduct } from '../IProduct';

interface CategoryIdDto extends ICategory {}
interface ProductIdDto extends Omit<IProduct, 'categoryId'> {
    categoryId: CategoryIdDto
}
export interface DocItemDto extends Omit<IDocItem, 'productId'> {
    productId: ProductIdDto
}

export interface DocOrderDto extends Omit<IDocOrder, 'customerId' | 'userId' | 'createdAt' | 'updatedAt' | 'docType' | 'warehouseId'> {
    docType: 'Order'
    customerId?: { _id: string, name: string }
}
export interface DocTransferDto extends Omit<IDocTransfer, 'fromWarehouseId' | 'toWarehouseId'> {
    docType: 'Transfer'
    fromWarehouseId?: { _id: string, name: string }
    toWarehouseId?: { _id: string, name: string }
}
export interface DocIncomingDto extends Omit<IDocIncoming, 'supplierId' | 'warehouseId'> {
    docType: 'Incoming'
    supplierId?: { _id: string, name: string }
    warehouseId?: { _id: string, name: string }
}
export interface DocOutgoingDto extends Omit<IDoc, 'customerId' | 'warehouseId'> {
    docType: 'Outgoing'
    customerId?: { _id: string, name: string }
    warehouseId?: { _id: string, name: string }
}

export type DocDto = DocOrderDto | DocTransferDto | DocIncomingDto | DocOutgoingDto

export interface DocAndItemsDto {
    doc: DocDto
    items: DocItemDto[];
}