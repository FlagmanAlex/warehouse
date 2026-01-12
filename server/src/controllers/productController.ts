import { Request, Response } from 'express';
import mongoose, { Document, Types } from 'mongoose';
import { IProduct } from '@warehouse/interfaces';
import { ProductDto } from '@warehouse/interfaces/DTO';
import { CategoryModel, ParfumModel, PriceHistoryModel, ProductModel, VitaminModel } from '@models';

interface CreateProductRequest extends Request {
    body: ProductDto
}

export const productController = {
    // Создание товара + запись в историю цен
    async createProduct(req: CreateProductRequest, res: Response) {
        try {

            const body = req.body

            if (!body.article || !body.name || !body.categoryId) {
                res.status(400).json({ message: 'Обязательные поля: article, name, categoryId' });
                console.log('Обязательные поля: article, name, categoryId');
                return
            }

            // Проверка существования категории и поставщика
            const [categoryExists] = await Promise.all([
                CategoryModel.findById(body.categoryId),
            ]);

            if (!categoryExists) {
                console.log(`Категория не найдена`)
                res.status(404).json({ message: `Категория не найдена` });
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

        interface ResponseProductDto extends Document { }

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
            const productId = req.params.id;

            // 1. Извлекаем productType и остальные данные
            // Мы ожидаем, что тип продукта либо пришел в запросе, либо уже есть в базе
            const { price, productType, ...updateData }: Partial<IProduct> = req.body;

            // 2. Находим текущий документ базовой моделью
            const currentProduct = await ProductModel.findById(productId);
            if (!currentProduct) {
                return res.status(404).json({ error: 'Товар не найден в базе' });
            }

            // 3. Определяем финальный тип продукта (приоритет у того, что пришло в body)
            const finalType = productType || (currentProduct as any).productType;

            if (!finalType) {
                return res.status(400).json({ error: 'Не удалось определить тип продукта для обновления' });
            }

            // 4. Выбираем модель через switch/case для строгой типизации и масштабируемости
            let TargetModel: mongoose.Model<any>;

            switch (finalType) {
                case 'Vitamin':
                    TargetModel = VitaminModel;
                    break;
                case 'Parfum':
                    TargetModel = ParfumModel;
                    break;
                // Сюда легко добавлять новые типы в будущем:
                // case 'Cosmetics':
                //     TargetModel = CosmeticsModel;
                //     break;
                default:
                    return res.status(400).json({ error: `Тип продукта "${finalType}" не поддерживается системой` });
            }

            // 5. Логика истории цен
            if (price !== undefined && Number(price) !== currentProduct.price) {
                await PriceHistoryModel.updateMany(
                    { productId, endDate: null },
                    { $set: { endDate: new Date() } }
                );

                await PriceHistoryModel.create({
                    productId,
                    price: Number(price),
                    startDate: new Date(),
                    endDate: null
                });
            }

            // 6. Очистка системных полей
            const protectedFields = ['createdBy', '_id', 'createdAt', '__v'];
            protectedFields.forEach(field => delete (updateData as any)[field]);

            // 7. Выполнение обновления через КОНКРЕТНУЮ модель
            const updatedProduct = await TargetModel.findByIdAndUpdate(
                productId,
                {
                    $set: {
                        ...updateData,
                        productType: finalType, // Гарантируем запись типа
                        price: price !== undefined ? Number(price) : currentProduct.price,
                        lastUpdateBy: (req as any).userId,
                        updatedAt: new Date()
                    }
                },
                {
                    new: true,           // Вернуть результат
                    runValidators: true, // Проверить схему (особенно важные поля конкретного типа)
                    overwriteDiscriminatorProps: true,
                    // strict: true,     // Теперь можно оставить true, так как модель соответствует типу
                }
            );

            return res.status(200).json(updatedProduct);

        } catch (error: any) {
            console.error('Ошибка при обновлении продукта:', error);

            if (error.code === 11000) {
                return res.status(400).json({ error: 'Продукт с таким артикулом уже существует' });
            }

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Данные не соответствуют схеме типа продукта',
                    details: error.errors
                });
            }

            return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
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