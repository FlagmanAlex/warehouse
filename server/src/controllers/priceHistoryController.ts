import { Request, Response } from 'express';
import { PriceHistoryModel } from '../models/priceHistoryModel';

export const getAllPriceHistories = async (req: Request, res: Response) => {
    try {
        const priceHistories = await PriceHistoryModel.find();
        res.status(200).json(priceHistories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price histories' });
    }
};

export const createPriceHistory = async (req: Request, res: Response) => {
    try {
        const newPriceHistory = new PriceHistoryModel(req.body);
        await newPriceHistory.save();
        res.status(201).json(newPriceHistory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create price history' });
    }
};
