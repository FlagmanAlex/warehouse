# Спецификация проекта Warehouse Management System

## 1. Общая информация

| Параметр | Значение |
|----------|----------|
| **Название** | Warehouse Management System (WMS) |
| **Описание** | Система складского учёта |
| **Версия** | 1.0.0 |
| **Тип проекта** | Монорепа (multi-workspace) |
| **Репозиторий** | https://github.com/FlagmanAlex/warehouse |

---

## 2. Архитектура проекта

### 2.1. Структура монорепы

```
Warehouse/
├── client/          # Мобильное приложение (React Native / Expo)
├── web/             # Веб-приложение (React + Vite)
├── server/          # Backend (Node.js + Express + MongoDB)
├── interfaces/      # Общие TypeScript интерфейсы и DTO
├── config/          # Общие конфигурационные файлы
├── plans/           # План улучшений и документация
└── config/          # Конфигурации
```

### 2.2. Технологический стек

#### Backend (`server/`)
| Технология | Назначение |
|------------|------------|
| Node.js | Платформа выполнения |
| TypeScript 5.8.3 | Язык разработки |
| Express 5.1.0 | Веб-фреймворк |
| Mongoose 8.14.1 | ODM для MongoDB |
| MongoDB | База данных |
| JWT | Аутентификация |
| bcryptjs | Хеширование паролей |
| multer | Загрузка файлов |
| exceljs | Работа с Excel |
| Vitest | Тестирование |

#### Web-клиент (`web/`)
| Технология | Назначение |
|------------|------------|
| React 19.1.1 | UI-фреймворк |
| React Router DOM 7.8.2 | Маршрутизация |
| Vite 7.1.2 | Сборщик |
| TypeScript 5.9.3 | Типизация |
| Vitest | Тестирование |
| react-icons | Иконки |

#### Общие интерфейсы (`interfaces/`)
| Компонент | Назначение |
|-----------|------------|
| TypeScript интерфейсы | Общие типы данных |
| DTO | Объекты передачи данных |
| Конфигурации | Статусы, типы документов |

---

## 3. Функциональные модули

### 3.1. Справочники

| Модуль | Описание | API |
|--------|----------|-----|
| **Товары** (`Product`) | Каталог продукции с поддержкой типов: парфюмерия, витамины, косметика, спортпит | `/api/product` |
| **Категории** (`Category`) | Категоризация товаров | `/api/category` |
| **Поставщики** (`Supplier`) | База поставщиков | `/api/supplier` |
| **Клиенты** (`Customer`) | База клиентов | `/api/customer` |
| **Склады** (`Warehouse`) | Управление складами | `/api/warehouse` |
| **Адреса** (`Address`) | Адресная книга | `/api/address` |
| **Пользователи** (`User`) | Управление пользователями и аутентификация | `/api/auth` |

### 3.2. Документооборот

| Тип документа | Описание | API | Статусы |
|---------------|----------|-----|---------|
| **Заказ приход** (`OrderIn`) | Заказ поставщику | `/api/doc` | Draft, InProgress, InDelivery, Completed, Canceled |
| **Заказ расход** (`OrderOut`) | Заказ от клиента | `/api/doc` | Draft, Reserved, Shipped, Completed, Canceled |
| **Приход** (`Incoming`) | Поступление товара | `/api/doc` | Draft, Shipped, TransitHub, InTransitDestination, Delivered, Canceled |
| **Расход** (`Outgoing`) | Отгрузка товара | `/api/doc` | Draft, Reserved, Shipped, Completed, Canceled |
| **Перемещение** (`Transfer`) | Перемещение между складами | `/api/doc` | Draft, InTransit, Received, Canceled |

### 3.3. Складские операции

| Модуль | Описание | API |
|--------|----------|-----|
| **Остатки** (`Inventory`) | Управление остатками товаров | `/api/inventory` |
| **Партии** (`Batch`) | Управление партиями товаров | `/api/batch` |
| **Транзакции** (`Transaction`) | Журнал операций | `/api/transaction` |
| **История цен** (`PriceHistory`) | Отслеживание изменения цен | `/api/price-history` |

### 3.4. Доставка

| Модуль | Описание | API |
|--------|----------|-----|
| **Документы доставки** (`DeliveryDoc`) | Документы доставки | `/api/delivery` |
| **Позиции доставки** (`DeliveryItem`) | Позиции в доставке | `/api/delivery` |

### 3.5. Финансы

| Модуль | Описание | API |
|--------|----------|-----|
| **Платежи** (`Payment`) | Учёт платежей | `/api/payment` |
| **Счета** (`Account`) | Управление счетами | `/api/account` |

### 3.6. Отчётность

| Отчёт | Описание |
|-------|----------|
| **Отчёт по готовности** (`InProgressReport`) | Документы в работе |
| **Отчёт по клиентам (в работе)** | Статусы заказов по клиентам |
| **Отчёт по доставке** | Документы в пути |

---

## 4. Модель данных

### 4.1. Основные сущности

#### Товар (`IProduct`)
```typescript
type IProduct = IParfum | IVitamin | ISport | ICosmetic

IBaseProduct {
  article: string              // Артикул
  name: string                 // Наименование
  description?: string         // Описание
  categoryId: string           // Категория
  unitOfMeasurement?: string   // Ед. измерения
  price: number                // Цена
  minStock?: number            // Мин. запас
  isArchived: boolean          // Архив
  createdBy?: string           // Создатель
  supplierId?: string          // Поставщик
  defaultWarehouseId?: string  // Склад по умолчанию
  productType: ProductType     // Тип продукта
}
```

#### Документ (`IDoc`)
```typescript
type IDoc = IDocIncoming | IDocOutgoing | IDocOrderOut | IDocOrderIn | IDocTransfer

IDocBase {
  orderNum: string      // Входящий номер
  docNum: string        // Внутренний номер
  docDate: Date         // Дата
  bonusRef: number      // Вознаграждение
  itemCount: number     // Кол-во позиций
  summ: number          // Сумма
  warehouseId: string   // Склад
  userId: string        // Создатель
  docType: DocTypeName  // Тип документа
  docStatus: DocStatusName // Статус
  priority?: PriorityOrder // Приоритет
}
```

### 4.2. Типы продуктов (`ProductType`)

| Тип | Описание |
|-----|----------|
| `Parfum` | Парфюмерия (с нотами, брендами) |
| `Vitamin` | Витамины и БАДы |
| `Sport` | Спортивное питание |
| `Cosmetic` | Косметика |

### 4.3. Статусы документов

| Группа статусов | Статусы |
|-----------------|---------|
| **Приход** | Draft, Shipped, TransitHub, InTransitDestination, Delivered, Canceled |
| **Расход** | Draft, Reserved, Shipped, Completed, Canceled |
| **Перемещение** | Draft, InTransit, Received, Canceled |
| **Заказы** | Draft, InProgress, InDelivery, Completed, Canceled |

---

## 5. API структура

### 5.1. Маршруты API

```
/api
├── /auth              # Аутентификация (без middleware)
├── /address           # Адреса
├── /category          # Категории
├── /product           # Товары
├── /warehouse         # Склады
├── /batch             # Партии
├── /customer          # Клиенты
├── /inventory         # Остатки
├── /doc               # Документы
├── /doc-items         # Позиции документов
├── /price-history     # История цен
├── /supplier          # Поставщики
├── /transaction       # Транзакции
├── /delivery          # Доставка
└── /upload            # Загрузка файлов
```

### 5.2. Безопасность

- **JWT-аутентификация** — применяется ко всем маршрутам кроме `/api/auth`
- **middleware `authMiddleware`** — проверка токена доступа

---

## 6. Веб-интерфейс

### 6.1. Страницы приложения

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/` | `DocScreen` | Список документов |
| `/docs` | `DocScreen` | Список документов |
| `/doc/:id` | `DocForm` | Форма документа |
| `/login` | `LoginScreen` | Вход |
| `/register` | `RegisterScreen` | Регистрация |
| `/customers` | `CustomerList` | Список клиентов |
| `/customer/:id` | `CustomerForm` | Форма клиента |
| `/products` | `ProductList` | Список товаров |
| `/product-form/:id` | `ProductForm` | Форма товара |
| `/stock-product/:id` | `StockProduct` | Остатки по товару |
| `/stock-warehouse` | `StockWarehouse` | Остатки по складу |
| `/inprogress-report` | `InProgressReport` | Отчёт "В работе" |
| `/delivery-planning` | `DeliveryList` | Планирование доставки |
| `/delivery-form/:id` | `DeliveryForm` | Форма доставки |

### 6.2. Архитектура frontend

```
web/src/
├── api/           # API-клиенты
├── component/     # UI-компоненты
├── layout/        # Макеты страниц
├── pages/         # Страницы
├── routes/        # Маршруты (loaders, actions)
├── shared/        # Общие утилиты
├── types/         # Локальные типы
└── utils/         # Вспомогательные функции
```

---

## 7. Серверная архитектура

### 7.1. Структура backend

```
server/src/
├── controllers/   # Обработчики запросов (16 контроллеров)
├── models/        # Mongoose модели (19 моделей)
├── routes/        # Express маршруты (16 роутеров)
├── services/      # Бизнес-логика
├── middlewares/   # Промежуточное ПО
├── types/         # Локальные типы
└── utils/         # Утилиты
```

### 7.2. Сервисный слой

| Сервис | Описание |
|--------|----------|
| `DeliveryService` | Логика доставки |
| `DocItemService` | Операции с позициями документов |
| `InventoryService` | Управление остатками |
| `StatusService` | Управление статусами |
| `StockService` | Операции со stock |
| `TransactionService` | Транзакции |

---

## 8. Конфигурация

### 8.1. Переменные окружения

| Переменная | Описание |
|------------|----------|
| `BD_NAME_WAREHOUSE` | Имя базы данных MongoDB |
| `BD_TOKEN` | Строка подключения MongoDB |
| `PORT` | Порт сервера (по умолчанию 3000) |

### 8.2. Конфигурационные файлы (`config/`)

| Файл | Назначение |
|------|------------|
| `DocType.ts` | Типы документов (5 типов) |
| `DocStatus.ts` | Статусы документов и переходы |
| `ProductType.ts` | Типы продуктов |
| `Color.ts` | Цветовая схема |
| `Server.ts` | Настройки сервера |

---

## 9. Скрипты проекта

| Скрипт | Описание |
|--------|----------|
| `npm run server` | Запуск backend |
| `npm run web` | Запуск web (dev) |
| `npm run web:build` | Сборка web |
| `npm run client` | Запуск mobile client |
| `npm run import` | Импорт данных |
| `npm run test:server` | Тесты backend |
| `npm run test:web` | Тесты web |
| `npm run test:coverage` | Покрытие тестами |
| `npm run test:ui` | UI тестов |

---

## 10. Известные проблемы и технический долг

### 10.1. Критические проблемы

| Проблема | Приоритет |
|----------|-----------|
| Непоследовательное применение `authMiddleware` | Высокий |
| Опечатка в роуте: `docItemssRouter` → `docItemsRouter` | Средний |
| Отсутствие валидации входных данных | Высокий |
| Бизнес-логика в контроллерах | Средний |

### 10.2. Улучшения

- Микросервисная архитектура (разделение по доменам)
- API Gateway для кросс-функциональных задач
- Кэширование (Redis)
- Индексы MongoDB для часто запрашиваемых полей
- Shared UI-библиотека компонентов
- Swagger/OpenAPI документация
- CI/CD пайплайн

---

## 11. Планы развития

### Фаза 1 — Безопасность и стабильность
1. Исправление middleware аутентификации
2. Валидация и санитизация входных данных
3. Исправление опечаток
4. Стандартизация обработки ошибок

### Фаза 2 — Производительность
1. Оптимизация запросов к БД
2. Кэширование
3. Индексы MongoDB

### Фаза 3 — Качество кода
1. Выделение сервисного слоя
2. Юнит-тесты (>80% покрытия)
3. Документация API

---

## 12. Контакты

- **Автор**: (не указан)
- **GitHub**: https://github.com/FlagmanAlex/warehouse
- **Issues**: https://github.com/FlagmanAlex/warehouse/issues

---

*Документ сгенерирован: 25 марта 2026 г.*
