import { TransactionModel } from "@models";

export class TransactionService {
    /********************************************
     * Создать запись транзакции
     * @param userId - идентификатор пользователя
     * @param productId - идентификатор продукта
     * @param quantity - количество
     ********************************************/
    static async createOutgoing(userId: string, productId: string, quantity: number) {
        const transaction = await TransactionModel.create({
            userId,
            productId,
            quantity,
            transactionType: 'Outgoing'
        });
        console.log( 'Создание транзакции расхода', transaction );
    }

    /********************************************
     * Удалить запись транзакции
     * @param transactionId - идентификатор транзакции
     ********************************************/
    static async delete(transactionId: string) {
        // Логика удаления транзакции
        console.log( 'Удаление транзакции', transactionId );
        
    }

    /********************************************
     * Получить все транзакции для пользователя
     * @param userId - идентификатор пользователя
     * @returns массив транзакций
     ********************************************/
    static async getAllForUser(userId: string) {
        // Логика получения транзакций для пользователя
        console.log( 'Получение транзакций для пользователя', userId );
        return [];
    }
}