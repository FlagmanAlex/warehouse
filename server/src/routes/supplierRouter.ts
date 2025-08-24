import express from 'express';
import { supplierController } from '@controllers';

export const supplierRouter = express.Router();

// Получение списка всех поставщиков
supplierRouter.get('/', supplierController.getAllSuppliers);

// Создание нового поставщика
supplierRouter.post('/', supplierController.createSupplier);