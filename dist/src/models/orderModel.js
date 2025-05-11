"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Схема для заказов
const orderSchema = new mongoose_1.Schema({
    orderType: { type: String, enum: ['Приход', 'Расход'] },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: function () { return this.orderType === 'Приход'; }
    }, // Ссылка на клиента
    supplierId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: function () { return this.orderType === 'Расход'; }
    }, // Ссылка на поставщика
    warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse', required: true }, // Ссылка на склад
    orderDate: { type: Date, default: Date.now }, // Дата заказа
    status: { type: String, enum: ['В ожидании', 'Завершен', 'Отменен'], default: 'В ожидании' } // Статус заказа
});
orderSchema.index({ orderDate: -1 }); // Сортировка заказов по дате
orderSchema.index({ status: 1 }); // Фильтрация по статусу
orderSchema.index({ customerId: 1, orderDate: -1 }); // История заказов клиента
exports.OrderModel = mongoose_1.default.model('Order', orderSchema, 'Order');
