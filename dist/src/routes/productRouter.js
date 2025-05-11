"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
exports.productRouter = (0, express_1.Router)();
exports.productRouter.post('/', productController_1.productController.createProduct); // Создание товара
exports.productRouter.get('/', productController_1.productController.getProducts); // Получение списка товаров (с фильтрами и пагинацией)
exports.productRouter.get('/:id', productController_1.productController.getProductById); // Получение товара по ID
exports.productRouter.put('/:id', productController_1.productController.updateProduct); // Обновление товара
exports.productRouter.patch('/:id/archive', productController_1.productController.archiveProduct); // Архивирование товара
exports.productRouter.get('/search', productController_1.productController.searchProducts); // Поиск товаров по названию
exports.productRouter.get('/supplier/:supplierId', productController_1.productController.getSupplierProducts); // Получение товаров поставщика
