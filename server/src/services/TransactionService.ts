import { ITransactionModel, TransactionModel } from "@models";

interface CreateTransactionParams {
    transactionType: 'Приход' | 'Расход' | 'Перемещение' | 'Списание';
    docId: string;
    productId: string;
    warehouseId: string;
    batchId?: string | null;
    userId: string;
    previousQuantity: number;
    changedQuantity: number;
}

export class TransactionService {
    static async create(params: CreateTransactionParams): Promise<ITransactionModel> {
        const transaction = await TransactionModel.create({
            ...params,
            transactionDate: new Date(),
        });
        return transaction;
    }

    static async reverseByDocId(docId: string, type: 'Расход' | 'Приход' = 'Расход'): Promise<void> {
        await TransactionModel.deleteMany({ docId, transactionType: type });
    }

    static async getAllForUser(userId: string): Promise<ITransactionModel[]> {
        return TransactionModel.find({ userId }).sort({ transactionDate: -1 });
    }

    static async delete(transactionId: string): Promise<void> {
        await TransactionModel.findByIdAndDelete(transactionId);
    }
}
