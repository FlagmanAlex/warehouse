import { Request, Response } from 'express';
import { CustomerModel } from '@models';
import { Types } from 'mongoose';


export const customerController = {
    // Получить всех клиентов
    async getAllCustomers (req: Request, res: Response) {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const customers = await CustomerModel.find()
            res.status(200).json(customers);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch customers' });
        }
    },
    // Создать нового клиента
    async createCustomer (req: Request, res: Response) {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
    
            const newCustomer = new CustomerModel(req.body);
            newCustomer.accountManager = new Types.ObjectId(req.userId);
            await newCustomer.save();
            res.status(201).json(newCustomer);
        } catch (error) {
            console.error('Create customer error:', error);
            res.status(500).json({ error: 'Failed to create customer' });
        }
    },
    
    // Получить клиента по ID
    async getCustomerById  (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customer = await CustomerModel.findById(id);
    
            if (!customer) {
                res.status(404).json({ error: 'Customer not found' });
                return
            }
    
            res.status(200).json(customer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch customer by ID' });
        }
    },
    
    // Обновить клиента по ID
    async updateCustomer  (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedCustomer = await CustomerModel.findByIdAndUpdate(id, req.body, {
                new: true,
            });
    
            if (!updatedCustomer) {
                res.status(404).json({ error: 'Customer not found' });
                return
            }
    
            res.status(200).json(updatedCustomer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update customer' });
        }
    },
    
    // Удалить клиента по ID
    async deleteCustomer  (req: Request, res: Response)  {
        try {
            const { id } = req.params;
            const deletedCustomer = await CustomerModel.findByIdAndDelete(id);
    
            if (!deletedCustomer) {
                res.status(404).json({ error: 'Customer not found' });
                return;
            }
    
            res.status(200).json({ message: 'Customer deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete customer' });
        }
    }
};
