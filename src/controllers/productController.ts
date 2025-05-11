import { Request, Response } from 'express';
import { ProductModel } from '../models/productModel';
import { CategoryModel } from '../models/categoryModel';
import { SupplierModel } from '../models/supplierModel';
import { PriceHistoryModel } from '../models/priceHistoryModel';
import { Types } from 'mongoose';
import { IProduct } from '../interfaces/IProduct';

interface CreateProductRequest extends Request {
    body: {
        name: string;
        description?: string;
        category: Types.ObjectId;
        unitOfMeasurement?: string;
        price: number;
        supplier: Types.ObjectId;
    };
}

export const productController = {
    // Создание товара + запись в историю цен
    async createProduct(req: CreateProductRequest, res: Response) {
        try {
            const { name, description, category, unitOfMeasurement, price, supplier } = req.body;

            // Валидация
            if (!name || !price || !category || !supplier) {
                res.status(400).json({ error: 'Обязательные поля: name, price, category, supplier' });
            }

            // Проверка существования категории и поставщика
            const [categoryExists, supplierExists] = await Promise.all([
                CategoryModel.findById(category),
                SupplierModel.findById(supplier),
            ]);

            if (!categoryExists || !supplierExists) {
                res.status(404).json({
                    error: `${!categoryExists ? 'Категория' : 'Поставщик'} не найден`
                });
            }

            // Создание товара
            const product = new ProductModel({
                name,
                description,
                category,
                unitOfMeasurement,
                price,
                supplier,
            });

            await product.save();

            // Запись в историю цен
            await PriceHistoryModel.create({
                productId: product._id,
                price,
                startDate: new Date(),
            });

            res.status(201).json(product);
        } catch (error) {
            console.error('Ошибка при создании товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение списка товаров (с фильтрами и пагинацией)
    async getProducts(req: Request, res: Response) {
        try {
            const {
                category,
                supplier,
                minPrice,
                maxPrice,
                isArchived,
                page = 1,
                limit = 10
            } = req.query;

            const filter: Record<string, any> = {};
            if (category) filter.category = category;
            if (supplier) filter.supplier = supplier;
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = Number(minPrice);
                if (maxPrice) filter.price.$lte = Number(maxPrice);
            }
            if (isArchived !== undefined) filter.isArchived = isArchived === 'true';

            const products = await ProductModel.find(filter)
                .populate('category', 'name')
                .populate('supplier', 'name')
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));

            const total = await ProductModel.countDocuments(filter);

            res.json({
                data: products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                },
            });
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение товара по ID
    async getProductById(req: Request, res: Response) {
        try {
            const product = await ProductModel.findById(req.params.id)
                .populate('category', 'name')
                .populate('supplier', 'name contactPerson phone');

            if (product) {
                // Получаем историю цен
                const priceHistory = await PriceHistoryModel.find(
                    { productId: product._id },
                    { price: 1, startDate: 1, _id: 0 }
                ).sort({ startDate: -1 });

                res.json({ ...product, priceHistory });
            } else {
                res.status(404).json({ error: 'Товар не найден' });
            }

        } catch (error) {
            console.error('Ошибка при получении товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Обновление товара (с записью в историю цен при изменении цены)
    async updateProduct(req: Request, res: Response) {
        try {
            const { price, ...updateData } = req.body;
            const productId = req.params.id;

            // Получаем текущий товар
            const currentProduct: IProduct | null = await ProductModel.findById(productId);
            if (currentProduct) {
                // Если изменилась цена - обновляем и записываем в историю
                if (price && price !== currentProduct.price) {
                    await PriceHistoryModel.updateMany(
                        { productId, endDate: null },
                        { endDate: new Date() }
                    );

                    await PriceHistoryModel.create({
                        productId,
                        price: Number(price),
                        startDate: new Date(),
                    });
                }
                const updatedProduct = await ProductModel.findByIdAndUpdate(
                    productId,
                    { ...updateData, price },
                    { new: true }
                );
                res.status(200).json(updatedProduct);
            } else {
                res.status(404).json({ error: 'Товар не найден' });
            }

        } catch (error) {
            console.error('Ошибка при обновлении товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Архивирование товара (мягкое удаление)
    async archiveProduct(req: Request, res: Response) {
        try {
            const product = await ProductModel.findByIdAndUpdate(
                req.params.id,
                { isArchived: true },
                { new: true }
            );

            if (!product) {
                res.status(404).json({ error: 'Товар не найден' });
            }

            res.json({ message: 'Товар архивирован', product });
        } catch (error) {
            console.error('Ошибка при архивировании товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    //Поиск товаров по названию (полнотекстовый поиск)
    async searchProducts(req: Request, res: Response) {
        try {
            const { query } = req.query;
            if (query) {
                const products = await ProductModel.find(
                    { $text: { $search: query.toString() } },
                    { score: { $meta: 'textScore' } }
                )
                    .sort({ score: { $meta: 'textScore' } })
                    .limit(10);
                res.json(products);
            } else {
                res.status(400).json({ error: 'Параметр query обязателен' });
            }
        } catch (error) {
            console.error('Ошибка при поиске товаров:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    //Получение товаров поставщика
    async getSupplierProducts(req: Request, res: Response) {
        try {
            const products = await ProductModel.find({
                supplier: req.params.supplierId
            }).populate('category', 'name');

            res.json(products);
        } catch (error) {
            console.error('Ошибка при получении товаров поставщика:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

};