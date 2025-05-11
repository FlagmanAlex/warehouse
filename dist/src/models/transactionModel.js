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
exports.TransactionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Схема для транзакций
const transactionSchema = new mongoose_1.Schema({
    transactionType: { type: String, enum: ['Приход', 'Расход', 'Перемещение', 'Списание'], required: true }, // Тип транзакции
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' }, // Ссылка на заказ (если есть)
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true }, // Ссылка на товар
    warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse', required: true }, // Ссылка на склад
    batchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Batch', required: true }, // Ссылка на партию
    quantity: { type: Number, required: true }, // Количество товара
    transactionDate: { type: Date, default: Date.now }, // Дата транзакции
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
});
transactionSchema.index({ productId: 1 }); // История движений товара
transactionSchema.index({ batchId: 1 }); // Все операции с партией
transactionSchema.index({ transactionDate: -1 }); // Свежие транзакции первыми
exports.TransactionModel = mongoose_1.default.model('Transaction', transactionSchema, 'Transaction');
