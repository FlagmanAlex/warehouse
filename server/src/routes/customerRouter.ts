import express from 'express';
import {
    getAllCustomers,
    createCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
} from '../controllers/customerController';
import { authMiddleware } from '../middleware/authMiddleware';

export const customerRouter = express.Router();

/**
 * @route   GET /customers
 * @desc    Получить всех клиентов
 */
customerRouter.get('/', getAllCustomers);

/**
 * @route   POST /customers
 * @desc    Создать нового клиента
 */
customerRouter.post('/', createCustomer);

/**
 * @route   GET /customers/:id
 * @desc    Получить клиента по ID
 */
customerRouter.get('/:id', getCustomerById);

/**
 * @route   PUT /customers/:id
 * @desc    Обновить клиента по ID
 */
customerRouter.put('/:id', updateCustomer);

/**
 * @route   DELETE /customers/:id
 * @desc    Удалить клиента по ID
 */
customerRouter.delete('/:id', deleteCustomer);