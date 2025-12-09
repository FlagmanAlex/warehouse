import type { IDeliveryItem } from "../IDeliveryItem";
import type { IAddress } from "../IAddress";
import type { ICustomer } from "../ICustomer";
import type { IDeliveryDoc } from "../IDeliveryDoc";
export interface DeliveryDocDTO extends Omit<IDeliveryDoc, 'creatorId'> {
    _id?: string;
    date: Date;
    totalCountEntity: number;
    totalCountDoc: number;
    totalSum: number;
}
interface IAddressDTO extends Omit<IAddress, 'customerId' | 'main'>{
    _id: string;
    address: string;
    gps: string;
}
interface ICustomerDTO extends Omit<ICustomer, 'accountManager'> {
    _id: string;
    name: string;
    phone: string;
}
export interface DeliveryItemsDTO extends Omit<IDeliveryItem, 'deliveryId' | 'customerId' | 'addressId'> {
    docIds: string[];
    customerId: ICustomerDTO;
    addressId: IAddressDTO;
    summ: number;
    entityCount: number;
    dTimePlan: Date;
    dTimeFact?: Date;    
}

export type DeliveryDto = {
    deliveryDoc: DeliveryDocDTO
    deliveryItems: DeliveryItemsDTO[]
}