import { IDeliveryItem } from "@warehouse/interfaces";
import mongoose from "mongoose";

export interface IDeliveryItemModel extends Omit<IDeliveryItem, 

    | '_id' 
    | 'deliveryId'
    | 'customerId'
    | 'addressId'

>, mongoose.Document {
    deliveryId: mongoose.Schema.Types.ObjectId
    customerId: mongoose.Schema.Types.ObjectId
    addressId: mongoose.Schema.Types.ObjectId
}

const deliveryItemSchema = new mongoose.Schema<IDeliveryItemModel>({
    docIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doc', required: true }],
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    summ: { type: Number, required: true },
    entityCount: { type: Number, required: true },
    dTimePlan: { type: Number, required: true },
    dTimeFact: { type: Number, required: false },
})

export const DeliveryItemModel = mongoose.model<IDeliveryItemModel>('DeliveryItem', deliveryItemSchema, 'DeliveryItem');

deliveryItemSchema.index({ deliveryId: 1 });
deliveryItemSchema.index({ customerId: 1 });
deliveryItemSchema.index({ addressId: 1 });
deliveryItemSchema.index({ dTimePlan: 1 });