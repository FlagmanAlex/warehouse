import { Request, Response } from 'express';
import { WarehouseModel } from '@models';

export const warehouseController = {
    // Создание склада (только админ)
    async createWarehouse(req: Request, res: Response) {
        try {
            const body = req.body;

            if (!body.name) {
                res.status(400).json({ error: 'Название склада обязательно' });
                return
            }

            const warehouse = new WarehouseModel({
                ...body
            });

            await warehouse.save();
            res.status(201).json(warehouse);
        } catch (error) {
            console.error('Ошибка при создании склада:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение списка складов (с пагинацией)
    async getWarehouses(req: Request, res: Response) {
        try {
            const warehouses = await WarehouseModel.find({})
            res.json(warehouses);
        } catch (error) {
            console.error('Ошибка при получении складов:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение склада по ID
    async getWarehouseById(req: Request, res: Response) {
        try {
            const warehouse = await WarehouseModel.findById(req.params.id)
                .populate('manager', 'username email');

            if (!warehouse) {
                res.status(404).json({ error: 'Склад не найден' });
                return
            }
            res.json(warehouse);
        } catch (error) {
            console.error('Ошибка при получении склада:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Обновление склада (только админ/менеджер)
    async updateWarehouse(req: Request, res: Response) {
        try {
            const { name, location, capacity, manager } = req.body;
            const warehouse = await WarehouseModel.findByIdAndUpdate(
                req.params.id,
                { name, location, capacity, manager },
                { new: true }
            ).populate('manager', 'username email');

            if (!warehouse) {
                res.status(404).json({ error: 'Склад не найден' });
                return
            }
            res.json(warehouse);
        } catch (error) {
            console.error('Ошибка при обновлении склада:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Удаление склада (только админ)
    async deleteWarehouse(req: Request, res: Response) {
        try {
            const warehouse = await WarehouseModel.findByIdAndDelete(req.params.id);
            if (!warehouse) {
                res.status(404).json({ error: 'Склад не найден' });
                return
            }
            res.json({ message: 'Склад удален' });
        } catch (error) {
            console.error('Ошибка при удалении склада:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};