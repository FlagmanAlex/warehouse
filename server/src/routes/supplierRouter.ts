import express from 'express';
import { getAllSuppliers, createSupplier } from '../controllers/supplierController';

export const supplierRouter = express.Router();

// Получение списка всех поставщиков
supplierRouter.get('/', getAllSuppliers);

// Создание нового поставщика
supplierRouter.post('/', createSupplier);