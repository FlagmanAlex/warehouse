import express from 'express';
import { priceHistoryController } from '@controllers';

export const priceHistoryRouter = express.Router();

// Получение истории цен
priceHistoryRouter.get('/', priceHistoryController.getAllPriceHistories);

// Создание новой записи в истории цен
priceHistoryRouter.post('/', priceHistoryController.createPriceHistory);