import { IDeliveryDoc } from "@interfaces";
import mongoose from "mongoose";

export interface IDeliveryDocModel extends Omit<IDeliveryDoc, '_id'>, Document {}

const deliveryDocSchema = new mongoose.Schema<IDeliveryDocModel>({
    date: { type: Date, required: true },
    timeInProgress: { type: Date },
    startTime: { type: Date, required: true },
    unloadTime: { type: Date },
    creatorId: { type: String, required: true },
    totalCountEntity: { type: Number, required: true },
    totalCountDoc: { type: Number, required: true },
    totalSum: { type: Number, required: true }
})

export const DeliveryDocModel = mongoose.model<IDeliveryDocModel>('DeliveryDoc', deliveryDocSchema, 'DeliveryDoc');