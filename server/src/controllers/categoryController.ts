import { Request, Response } from 'express';
import { CategoryModel, ProductModel } from '@models';
import { Types } from 'mongoose';

// Тип для запроса с возможным parentCategory
interface CreateCategoryRequest extends Request {
    body: {
        name: string;
        parentCategory?: Types.ObjectId;
    };
}

export const categoryController = {
    // Создание категории
    async createCategory(req: CreateCategoryRequest, res: Response) {
        try {
            const { name, parentCategory } = req.body;

            // Валидация
            if (!name) {
                res.status(400).json({ error: 'Название категории обязательно' });
                return
            }

            // Проверка существования родительской категории
            if (parentCategory) {
                const parentExists = await CategoryModel.findById(parentCategory);
                if (!parentExists) {
                    res.status(404).json({ error: 'Родительская категория не найдена' });
                }
            }

            const category = new CategoryModel({
                name,
                parentCategory: parentCategory || null,
            });

            await category.save();

            res.status(201).json(category);
        } catch (error) {
            console.error('Ошибка при создании категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение всех категорий (с древовидной структурой)
    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await CategoryModel.find();
            res.json(categories);
        } catch (error) {
            console.error('Ошибка при получении категорий:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение категории по ID
    async getCategoryById(req: Request, res: Response) {
        try {
            const category = await CategoryModel.findById(req.params.id)
                .populate('parentCategory', 'name'); // Подгружаем имя родителя

            if (!category) {
                res.status(404).json({ error: 'Категория не найдена' });
                return
            }
            res.json(category);
        } catch (error) {
            console.error('Ошибка при получении категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Обновление категории
    async updateCategory(req: Request, res: Response) {
        try {
            const { name, parentCategory } = req.body;
            const category = await CategoryModel.findByIdAndUpdate(
                req.params.id,
                { name, parentCategory },
                { new: true } // Возвращаем обновлённый документ
            );

            if (!category) {
                res.status(404).json({ error: 'Категория не найдена' });
                return
            }
            res.json(category);
        } catch (error) {
            console.error('Ошибка при обновлении категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Удаление категории (с проверкой на дочерние категории)
    async deleteCategory(req: Request, res: Response) {
        try {
            const categoryId = req.params.id;

            // Проверяем, есть ли дочерние категории
            const childCategories = await CategoryModel.find({ parentCategory: categoryId });
            if (childCategories.length > 0) {
                res.status(400).json({
                    error: 'Нельзя удалить категорию с дочерними элементами',
                });
                return
            }

            const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
            if (!deletedCategory) {
                res.status(404).json({ error: 'Категория не найдена' });
                return
            }
            res.json({ message: 'Категория удалена' });
        } catch (error) {
            console.error('Ошибка при удалении категории:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение дерева категорий
    async getCategoryTree(req: Request, res: Response): Promise<void> {
        try {
            const buildTree = async (parentId: Types.ObjectId | null = null): Promise<any[]> => {
                const categories = await CategoryModel.find({ parentCategory: parentId });
                const tree: any[] = await Promise.all(
                    categories.map(async (category): Promise<any> => ({
                        ...category.toObject(),
                        children: await buildTree(category._id as Types.ObjectId | null),
                    }))
                );
                return tree;
            };

            const tree = await buildTree();
            res.json(tree);
        } catch (error) {
            console.error('Ошибка при построении дерева:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получение товаров категории
    async getCategoryProducts(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.params.id;
            const childCategories = await CategoryModel.find({ parentCategory: categoryId });
            const categoryIds = [categoryId, ...childCategories.map(c => c._id)];

            const products = await ProductModel.find({ category: { $in: categoryIds } });
            res.json(products);
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};