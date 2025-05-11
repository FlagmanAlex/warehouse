"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const productModel_1 = require("../models/productModel");
const categoryModel_1 = require("../models/categoryModel");
const supplierModel_1 = require("../models/supplierModel");
const priceHistoryModel_1 = require("../models/priceHistoryModel");
exports.productController = {
    // Создание товара + запись в историю цен
    async createProduct(req, res) {
        try {
            const { name, description, category, unitOfMeasurement, price, supplier } = req.body;
            // Валидация
            if (!name || !price || !category || !supplier) {
                res.status(400).json({ error: 'Обязательные поля: name, price, category, supplier' });
            }
            // Проверка существования категории и поставщика
            const [categoryExists, supplierExists] = await Promise.all([
                categoryModel_1.CategoryModel.findById(category),
                supplierModel_1.SupplierModel.findById(supplier),
            ]);
            if (!categoryExists || !supplierExists) {
                res.status(404).json({
                    error: `${!categoryExists ? 'Категория' : 'Поставщик'} не найден`
                });
            }
            // Создание товара
            const product = new productModel_1.ProductModel({
                name,
                description,
                category,
                unitOfMeasurement,
                price,
                supplier,
            });
            await product.save();
            // Запись в историю цен
            await priceHistoryModel_1.PriceHistoryModel.create({
                productId: product._id,
                price,
                startDate: new Date(),
            });
            res.status(201).json(product);
        }
        catch (error) {
            console.error('Ошибка при создании товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Получение списка товаров (с фильтрами и пагинацией)
    async getProducts(req, res) {
        try {
            const { category, supplier, minPrice, maxPrice, isArchived, page = 1, limit = 10 } = req.query;
            const filter = {};
            if (category)
                filter.category = category;
            if (supplier)
                filter.supplier = supplier;
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice)
                    filter.price.$gte = Number(minPrice);
                if (maxPrice)
                    filter.price.$lte = Number(maxPrice);
            }
            if (isArchived !== undefined)
                filter.isArchived = isArchived === 'true';
            const products = await productModel_1.ProductModel.find(filter)
                .populate('category', 'name')
                .populate('supplier', 'name')
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));
            const total = await productModel_1.ProductModel.countDocuments(filter);
            res.json({
                data: products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                },
            });
        }
        catch (error) {
            console.error('Ошибка при получении товаров:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Получение товара по ID
    async getProductById(req, res) {
        try {
            const product = await productModel_1.ProductModel.findById(req.params.id)
                .populate('category', 'name')
                .populate('supplier', 'name contactPerson phone');
            if (product) {
                // Получаем историю цен
                const priceHistory = await priceHistoryModel_1.PriceHistoryModel.find({ productId: product._id }, { price: 1, startDate: 1, _id: 0 }).sort({ startDate: -1 });
                res.json({ ...product, priceHistory });
            }
            else {
                res.status(404).json({ error: 'Товар не найден' });
            }
        }
        catch (error) {
            console.error('Ошибка при получении товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Обновление товара (с записью в историю цен при изменении цены)
    async updateProduct(req, res) {
        try {
            const { price, ...updateData } = req.body;
            const productId = req.params.id;
            // Получаем текущий товар
            const currentProduct = await productModel_1.ProductModel.findById(productId);
            if (currentProduct) {
                // Если изменилась цена - обновляем и записываем в историю
                if (price && price !== currentProduct.price) {
                    await priceHistoryModel_1.PriceHistoryModel.updateMany({ productId, endDate: null }, { endDate: new Date() });
                    await priceHistoryModel_1.PriceHistoryModel.create({
                        productId,
                        price: Number(price),
                        startDate: new Date(),
                    });
                }
                const updatedProduct = await productModel_1.ProductModel.findByIdAndUpdate(productId, { ...updateData, price }, { new: true });
                res.status(200).json(updatedProduct);
            }
            else {
                res.status(404).json({ error: 'Товар не найден' });
            }
        }
        catch (error) {
            console.error('Ошибка при обновлении товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Архивирование товара (мягкое удаление)
    async archiveProduct(req, res) {
        try {
            const product = await productModel_1.ProductModel.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
            if (!product) {
                res.status(404).json({ error: 'Товар не найден' });
            }
            res.json({ message: 'Товар архивирован', product });
        }
        catch (error) {
            console.error('Ошибка при архивировании товара:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    //Поиск товаров по названию (полнотекстовый поиск)
    async searchProducts(req, res) {
        try {
            const { query } = req.query;
            if (query) {
                const products = await productModel_1.ProductModel.find({ $text: { $search: query.toString() } }, { score: { $meta: 'textScore' } })
                    .sort({ score: { $meta: 'textScore' } })
                    .limit(10);
                res.json(products);
            }
            else {
                res.status(400).json({ error: 'Параметр query обязателен' });
            }
        }
        catch (error) {
            console.error('Ошибка при поиске товаров:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    //Получение товаров поставщика
    async getSupplierProducts(req, res) {
        try {
            const products = await productModel_1.ProductModel.find({
                supplier: req.params.supplierId
            }).populate('category', 'name');
            res.json(products);
        }
        catch (error) {
            console.error('Ошибка при получении товаров поставщика:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};
