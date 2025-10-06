import express from 'express';
import { customerController } from '@controllers';

export const customerRouter = express.Router();

customerRouter.get('/', customerController.getAllCustomers);
customerRouter.post('/', customerController.createCustomer);
customerRouter.get('/:id', customerController.getCustomerById);
customerRouter.patch('/:id', customerController.updateCustomer);
customerRouter.delete('/:id', customerController.deleteCustomer);