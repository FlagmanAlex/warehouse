import mongoose, { Schema } from "mongoose";
import { IDocNum } from "@interfaces";

interface IDocNumModel extends IDocNum, mongoose.Document {
    _id: string
 }

const docNumSchema = new Schema<IDocNumModel>({
    _id: { type: String, required: true },
    nextNumber: { type: Number, default: 1 }
})

export const DocNumModel = mongoose.model<IDocNumModel>('DocNum', docNumSchema, 'DocNum');