import { Request, Response } from 'express';
import { SupplierModel } from '../models/supplierModel';

export const getAllSuppliers = async (req: Request, res: Response) => {
    try {
        const suppliers = await SupplierModel.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};

export const createSupplier = async (req: Request, res: Response) => {
    try {
        const newSupplier = new SupplierModel(req.body);
        await newSupplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create supplier' });
    }
};
