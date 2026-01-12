"use strict";
/*В источниках представлено описание интерфейсов (TypeScript) для различных типов документов (`IDocBase`, `IDocIncoming`, `IDocOutgoing` и др.), а также показан пример использования тестового фреймворка **Vitest**.
Ниже представлен пример кода тестирования структур данных (интерфейсов) с использованием `vitest`, фокусируясь на проверке наличия и типа ключевых полей, которые должны соответствовать определенным интерфейсам.
В этом примере используется синтаксис **TypeScript** и **Vitest**. Для полноты демонстрации мы воссоздаем импорт типов, определенных в источниках.*/
Object.defineProperty(exports, "__esModule", { value: true });
// server/tests/DocumentInterfaces.test.ts
const vitest_1 = require("vitest");
/*********************************
 * Моковые данные и Тесты Интерфейсов
 *********************************/
(0, vitest_1.describe)('Тестирование структур интерфейсов документов', () => {
    // Шаг 1: Тестирование базового типа PriorityOrder
    (0, vitest_1.it)('Должен корректно использовать определенные приоритеты заказа', () => {
        // Проверяем, что определенные строковые значения соответствуют типу PriorityOrder
        const highPriority = 'High'; // Высокий приоритет
        const mediumPriority = 'Medium'; // Средний приоритет
        (0, vitest_1.expect)(highPriority).toBe('High');
        (0, vitest_1.expect)(mediumPriority).toBe('Medium');
    });
    // Шаг 2: Тестирование интерфейса IDocIncoming
    (0, vitest_1.it)('Должен создавать объект, соответствующий структуре IDocIncoming с базовыми полями', () => {
        // Создаем моковый объект, который должен удовлетворять IDocIncoming 
        // (который включает IDocBase и общие поля)
        const mockIncomingDoc = {
            // Поля IDocBase
            orderNum: 'IN-P005',
            docNum: 'A-2024-001',
            // Специфические поля IDocIncoming
            vendorCode: 'TRACK98765', // № отслеживания
            supplierId: 'SUPPLIER-XYZ',
            exchangeRate: 92.5, // Курс
            expenses: 1500.0, // Логистика
            // Общие поля
            docDate: new Date('2024-05-15'),
            bonusRef: 100,
            itemCount: 5,
            summ: 15000,
            warehouseId: 'WH_MAIN',
            userId: 'user_admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            docType: 'Incoming', // Тип документа
            docStatus: 'Completed', // Статус
        };
        // Проверка наличия обязательных полей IDocBase
        (0, vitest_1.expect)(mockIncomingDoc).toHaveProperty('orderNum');
        (0, vitest_1.expect)(typeof mockIncomingDoc.docNum).toBe('string');
        // Проверка наличия специфических полей IDocIncoming
        (0, vitest_1.expect)(mockIncomingDoc).toHaveProperty('vendorCode');
        (0, vitest_1.expect)(mockIncomingDoc.exchangeRate).toBe(92.5); // Курс
        // Проверка наличия общих полей
        (0, vitest_1.expect)(mockIncomingDoc).toHaveProperty('itemCount', 5);
        (0, vitest_1.expect)(mockIncomingDoc).toHaveProperty('userId', 'user_admin');
        // Проверка типа документа
        (0, vitest_1.expect)(mockIncomingDoc.docType).toBe('Incoming');
    });
    // Шаг 3: Тестирование структуры IDocOutgoing
    (0, vitest_1.it)('Должен содержать customerId для документа Outgoing', () => {
        // Мы можем протестировать, что объект, созданный для Outgoing, 
        // должен включать поле customerId.
        const mockOutgoing = {
            orderNum: 'OUT-100',
            docNum: 'O-2024-001',
            customerId: 'CUST-B',
            // Заполнение обязательных общих полей...
            docDate: new Date(),
            bonusRef: 0,
            itemCount: 1,
            summ: 1000,
            warehouseId: 'WH-02',
            userId: 'user_seller',
            createdAt: new Date(),
            updatedAt: new Date(),
            docType: 'Outgoing', //
            docStatus: 'Shipped',
        };
        (0, vitest_1.expect)(mockOutgoing).toHaveProperty('customerId');
        (0, vitest_1.expect)(mockOutgoing.customerId).toBe('CUST-B');
    });
});
