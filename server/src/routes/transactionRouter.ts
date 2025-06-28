import express from 'express';
import { TransactionController } from '../controllers/transactionController';

export const transactionRouter = express.Router();

//Создание транзакции (Приход/расход/корректировка)
transactionRouter.post('/', TransactionController.createTransaction);
//История движения по товару
transactionRouter.get('/:id', TransactionController.getTransactionsByProduct);