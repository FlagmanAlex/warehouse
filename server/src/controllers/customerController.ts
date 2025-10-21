import { Request, Response } from 'express';
import { AddressModel, CustomerModel, DocModel } from '@models';
import { Types } from 'mongoose';
import { IAddress, ICustomer } from '@interfaces';


export const customerController = {
    // Получить всех клиентов
    async getAllCustomers (req: Request, res: Response) {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }
            const customers = await CustomerModel.find().lean();
            const addresses = await AddressModel.find().lean();
            const customersWithAddresses = customers.map((customer) => {
                const customerAddresses = addresses.filter((address) => address.customerId.toString() === customer._id!.toString());
                return {
                    ...customer,
                    addresses: customerAddresses
                };
            })
            res.status(200).json(customersWithAddresses);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении клиентов' });
        }
    },
    // Создать нового клиента
    async createCustomer (req: Request, res: Response) {
        console.log('Request body:', req.body);
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }

            const newCustomer = {
                ...req.body.customer,
                accountManager: new Types.ObjectId(req.userId)
            };
    
            console.log('New customer:', newCustomer);
            
            const createdCustomer = await CustomerModel.create(newCustomer);
    
            if (!createdCustomer) {
                res.status(500).json({ error: 'Ошибка при создании клиента' });
                return
            }
    
            res.status(201).json(createdCustomer);
        } catch (error) {
            console.error('Ошибка при создании клиента:', error);
            res.status(500).json({ error: 'Ошибка при создании клиента' });
        }
    },
    
    // Получить клиента по ID
    async getCustomerById  (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customer = await CustomerModel.findById(id);
    
            if (!customer) {
                res.status(404).json({ error: 'Клиент не найден' });
                return
            }
    
            res.status(200).json(customer);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении клиента по ID' });
        }
    },
    
    // Обновить клиента по ID
    async updateCustomer  (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedCustomer = await CustomerModel.findByIdAndUpdate(id, req.body.customer, {
                new: true,
            });
    
            if (!updatedCustomer) {
                res.status(404).json({ error: 'Клиент не найден' });
                return
            }
    
            res.status(200).json(updatedCustomer);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при обновлении клиента' });
        }
    },
    
    // Удалить клиента по ID
    async deleteCustomer  (req: Request, res: Response)  {
        try {
            const { id } = req.params;
            const customer = await CustomerModel.findById(id);
    
            if (!customer) {
                res.status(404).json({ error: 'Клиент не найден' });
                return
            }
            const documents = await DocModel.find({ customerId: customer._id });
            if (documents.length > 0) {
                res.status(400).json({ error: 'Нельзя удалить клиента с документами' });
                return
            }

            if (customer.name === '<Клиент не выбран>') {
                res.status(400).json({ error: 'Нельзя удалить <Клиент не выбран>' });
                return
            }

            await CustomerModel.findByIdAndDelete(id);   
    
            res.status(200).json({ message: 'Клиент удалён' });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при удалении клиента' });
        }
    }
};
