import type { IAddress } from '../IAddress';
import type { ICategory } from '../ICategory';
import type { IDocIncoming, IDocOrderIn, IDocOrderOut, IDocOutgoing, IDocTransfer } from '../IDoc';
import type { IDocItem } from '../IDocItem'
import type { IProduct } from '../IProduct';

interface CategoryIdDto extends ICategory {}
interface ProductIdDto extends Omit<IProduct, 'categoryId'> {
    categoryId: CategoryIdDto
}
export interface DocItemDto extends Omit<IDocItem, 'productId'> {
    productId: ProductIdDto
}

export interface DocOrderInDto extends Omit<IDocOrderIn, 'supplierId' | 'userId' | 'createdAt' | 'updatedAt' | 'docType' | 'warehouseId'> {
    docType: 'OrderIn'
    supplierId?: { _id: string, name: string }
    itemCount: number
    summ: number
}
export interface DocOrderOutDto extends Omit<IDocOrderOut, 'customerId' | 'userId' | 'createdAt' | 'updatedAt' | 'docType' | 'warehouseId' | 'deliveryAddress' | 'deliveryGps'> {
    _id: string
    docType: 'OrderOut'
    customerId?: { _id: string, name: string, phone: string, address: string, gps: string,  }
    itemCount: number
    deliveryAddress?: string
    deliveryGps?: string
    summ: number
}
export interface DocTransferDto extends Omit<IDocTransfer, 'fromWarehouseId' | 'toWarehouseId' | 'warehouseId'> {
    docType: 'Transfer'
    warehouseId?: { _id: string, name: string }
    fromWarehouseId?: { _id: string, name: string }
    toWarehouseId?: { _id: string, name: string }
    itemCount: number
    summ: number

}
export interface DocIncomingDto extends Omit<IDocIncoming, 'supplierId' | 'warehouseId'> {
    docType: 'Incoming'
    supplierId?: { _id: string, name: string }
    warehouseId?: { _id: string, name: string }
    itemCount: number
    summ: number

}
export interface DocOutgoingDto extends Omit<IDocOutgoing, 'customerId' | 'warehouseId'> {
    docType: 'Outgoing'
    customerId?: { _id: string, name: string, phone: string, address: string, gps: string }
    warehouseId?: { _id: string, name: string }
    itemCount: number
    addressId: IAddress
    summ: number
}

export type DocDto = DocOrderInDto | DocOrderOutDto | DocTransferDto | DocIncomingDto | DocOutgoingDto

export interface DocAndItemsDto {
    doc: DocDto
    items: DocItemDto[];
}