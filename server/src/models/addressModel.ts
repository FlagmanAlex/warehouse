import mongoose, { Document, Schema } from "mongoose";
import { IAddress } from "@interfaces";

export interface IAddressModel extends Omit<IAddress, '_id' | 'customerId'>, Document {
    customerId: Schema.Types.ObjectId;
}

const addressSchema = new Schema<IAddressModel>({
    main: { type: Boolean, default: false },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    address: { type: String, required: true },
    gps: { type: String, required: false },
    description: { type: String, required: false },
})

addressSchema.index({ customerId: 1, main: 1 });

export const AddressModel = mongoose.model<IAddressModel>('Address', addressSchema, 'Address');