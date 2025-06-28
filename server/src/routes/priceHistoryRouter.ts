import express from 'express';
import { getAllPriceHistories, createPriceHistory } from '../controllers/priceHistoryController';

export const priceHistoryRouter = express.Router();

// Получение истории цен
priceHistoryRouter.get('/', getAllPriceHistories);

// Создание новой записи в истории цен
priceHistoryRouter.post('/', createPriceHistory);