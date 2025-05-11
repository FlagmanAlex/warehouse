"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const categoryModel_1 = require("../models/categoryModel");
const productModel_1 = require("../models/productModel");
exports.categoryController = {
    // Создание категории
    async createCategory(req, res) {
        try {
            const { name, parentCategory } = req.body;
            // Валидация
            if (!name) {
                res.status(400).json({ error: 'Название категории обязательно' });
            }
            // Проверка существования родительской категории
            if (parentCategory) {
                const parentExists = await categoryModel_1.CategoryModel.findById(parentCategory);
                if (!parentExists) {
                    res.status(404).json({ error: 'Родительская категория не найдена' });
                }
            }
            const category = new categoryModel_1.CategoryModel({
                name,
                parentCategory: parentCategory || null,
            });
            await category.save();
            res.status(201).json(category);
        }
        catch (error) {
            console.error('Ошибка при создании категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Получение всех категорий (с древовидной структурой)
    async getAllCategories(req, res) {
        try {
            const categories = await categoryModel_1.CategoryModel.find();
            res.json(categories);
        }
        catch (error) {
            console.error('Ошибка при получении категорий:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Получение категории по ID
    async getCategoryById(req, res) {
        try {
            const category = await categoryModel_1.CategoryModel.findById(req.params.id)
                .populate('parentCategory', 'name'); // Подгружаем имя родителя
            if (!category) {
                res.status(404).json({ error: 'Категория не найдена' });
            }
            res.json(category);
        }
        catch (error) {
            console.error('Ошибка при получении категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Обновление категории
    async updateCategory(req, res) {
        try {
            const { name, parentCategory } = req.body;
            const category = await categoryModel_1.CategoryModel.findByIdAndUpdate(req.params.id, { name, parentCategory }, { new: true } // Возвращаем обновлённый документ
            );
            if (!category) {
                res.status(404).json({ error: 'Категория не найдена' });
            }
            res.json(category);
        }
        catch (error) {
            console.error('Ошибка при обновлении категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Удаление категории (с проверкой на дочерние категории)
    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;
            // Проверяем, есть ли дочерние категории
            const childCategories = await categoryModel_1.CategoryModel.find({ parentCategory: categoryId });
            if (childCategories.length > 0) {
                res.status(400).json({
                    error: 'Нельзя удалить категорию с дочерними элементами',
                });
            }
            const deletedCategory = await categoryModel_1.CategoryModel.findByIdAndDelete(categoryId);
            if (!deletedCategory) {
                res.status(404).json({ error: 'Категория не найдена' });
            }
            res.json({ message: 'Категория удалена' });
        }
        catch (error) {
            console.error('Ошибка при удалении категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Получение дерева категорий
    async getCategoryTree(req, res) {
        try {
            const buildTree = async (parentId = null) => {
                const categories = await categoryModel_1.CategoryModel.find({ parentCategory: parentId });
                const tree = await Promise.all(categories.map(async (category) => ({
                    ...category.toObject(),
                    children: await buildTree(category._id),
                })));
                return tree;
            };
            const tree = await buildTree();
            res.json(tree);
        }
        catch (error) {
            console.error('Ошибка при построении дерева:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    // Получение товаров категории
    async getCategoryProducts(req, res) {
        try {
            const categoryId = req.params.id;
            const childCategories = await categoryModel_1.CategoryModel.find({ parentCategory: categoryId });
            const categoryIds = [categoryId, ...childCategories.map(c => c._id)];
            const products = await productModel_1.ProductModel.find({ category: { $in: categoryIds } });
            res.json(products);
        }
        catch (error) {
            console.error('Ошибка при получении товаров:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};
