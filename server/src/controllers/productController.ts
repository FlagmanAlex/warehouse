import { Request, Response } from 'express';
import { ProductModel } from '../models/productModel';
import { CategoryModel } from '../models/categoryModel';
import { SupplierModel } from '../models/supplierModel';
import { PriceHistoryModel } from '../models/priceHistoryModel';
import { Document, Types } from 'mongoose';
import { IProduct } from '../../../interfaces/IProduct';

interface CreateProductRequest extends Request {
    body: {
        article: string
        name: string;
        description?: string;
        categoryId: Types.ObjectId;
        unitOfMeasurement?: string;
        price: number;
        supplierId: Types.ObjectId
        createdBy: Types.ObjectId
        lastUpdateBy: Types.ObjectId
        isArchived: boolean
    };
}

export const productController = {
    // Создание товара + запись в историю цен
    async createProduct(req: CreateProductRequest, res: Response) {
        try {

            const body = req.body
            // Валидация

            if (!body.article || !body.name || !body.categoryId || !body.supplierId) {
                res.status(400).json({ message: 'Обязательные поля: article, name, categoryId, supplierId' });
                console.log('Обязательные поля: article, name, categoryId, supplierId');
                return
            }

            // Проверка существования категории и поставщика
            const [categoryExists, supplierExists] = await Promise.all([
                CategoryModel.findById(body.categoryId),
                SupplierModel.findById(body.supplierId),
            ]);

            if (!categoryExists || !supplierExists) {
                console.log(`${!categoryExists ? 'Категория' : 'Поставщик'} не найден`)
                res.status(404).json({ message: `${!categoryExists ? 'Категория' : 'Поставщик'} не найден` });
                return
            }

            // Создание товара
            const product = await ProductModel.create({ ...body });

            // Запись в историю цен
            await PriceHistoryModel.create({
                productId: product._id,
                price: body.price,
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

        interface ResponseProductDto extends Document {}

        try {
            const products: ResponseProductDto[] = await ProductModel.find({})
                .populate('categoryId', 'name')
                .populate('supplierId', 'name')
                .populate('createdBy', 'username')
                .populate('lastUpdateBy', 'username');
            res.json(products);
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение товара по ID
    async getProductById(req: Request, res: Response) {
        try {
            const product = await ProductModel.findById(req.params.id)
                .populate('categoryId', 'name')
                .populate('supplierId', 'name contactPerson phone');

            if (product) {
                // Получаем историю цен
                const priceHistory = await PriceHistoryModel.find(
                    { productId: product._id },
                    { price: 1, startDate: 1, _id: 0 }
                ).sort({ startDate: -1 });

                res.json(product);
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
                return
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