"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
exports.categoryRouter = express_1.default.Router();
exports.categoryRouter.post('/', categoryController_1.categoryController.createCategory);
exports.categoryRouter.get('/', categoryController_1.categoryController.getAllCategories);
exports.categoryRouter.get('/tree', categoryController_1.categoryController.getCategoryTree); // Опционально
exports.categoryRouter.get('/:id', categoryController_1.categoryController.getCategoryById);
exports.categoryRouter.get('/:id/products', categoryController_1.categoryController.getCategoryProducts); // Опционально
exports.categoryRouter.patch('/:id', categoryController_1.categoryController.updateCategory);
exports.categoryRouter.delete('/:id', categoryController_1.categoryController.deleteCategory);
