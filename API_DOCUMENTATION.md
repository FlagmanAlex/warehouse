# API Документация Warehouse Management System

## Содержание

1. [Общая информация](#общая-информация)
2. [Аутентификация](#аутентификация)
3. [Справочники](#справочники)
4. [Документооборот](#документооборот)
5. [Складские операции](#складские-операции)
6. [Доставка](#доставка)
7. [Файлы](#файлы)
8. [Коды ответов](#коды-ответов)

---

## Общая информация

**Базовый URL:** `http://localhost:3000/api`

**Формат данных:** JSON

**Аутентификация:** JWT Bearer Token (кроме `/auth/register` и `/auth/login`)

### Заголовки запроса

| Заголовок | Значение |
|-----------|----------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer <token>` (для защищённых endpoints) |

---

## Аутентификация

### POST `/auth/register`

Регистрация нового пользователя.

**Доступ:** Публичный

**Тело запроса:**
```json
{
  "username": "string (required)",
  "email": "string (required, email)",
  "password": "string (required, min 6)",
  "role": "string (optional, default: 'user')"
}
```

**Ответ 201:**
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  },
  "token": "string"
}
```

**Ответ 400:**
```json
{ "error": "Все поля обязательны" }
```

**Ответ 400:**
```json
{ "message": "Email уже используется" }
```

---

### POST `/auth/login`

Авторизация пользователя.

**Доступ:** Публичный

**Тело запроса:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Ответ 200:**
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  },
  "token": "string"
}
```

**Ответ 401:**
```json
{ "error": "Неверный email или пароль" }
```

---

### GET `/auth/profile`

Получение данных текущего пользователя.

**Доступ:** Защищённый

**Ответ 200:**
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "createdAt": "date"
}
```

---

### GET `/auth/users`

Получение списка пользователей с пагинацией.

**Доступ:** Только администратор

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `page` | number | Номер страницы (default: 1) |
| `limit` | number | Количество на странице (default: 10) |

**Ответ 200:**
```json
{
  "data": [
    {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

### PATCH `/auth/users/:id/role`

Обновление роли пользователя.

**Доступ:** Только администратор

**Параметры пути:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string | ID пользователя |

**Тело запроса:**
```json
{
  "role": "admin | manager | user"
}
```

**Ответ 200:**
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "role": "string"
}
```

**Ответ 400:**
```json
{ "error": "Недопустимая роль" }
```

**Ответ 403:**
```json
{ "error": "Доступ запрещён" }
```

---

### GET `/auth/check`

Проверка валидности токена.

**Доступ:** Защищённый

**Ответ 200:**
```json
{ "message": "Token is valid" }
```

**Ответ 401:**
```json
{ "error": "Требуется авторизация" }
```

---

## Справочники

### Товары (`/product`)

#### POST `/product`

Создание нового товара.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "article": "string (required)",
  "name": "string (required)",
  "categoryId": "string (required)",
  "description": "string",
  "unitOfMeasurement": "шт | кг | мл | л | г",
  "price": "number (required)",
  "minStock": "number",
  "isArchived": "boolean",
  "supplierId": "string",
  "defaultWarehouseId": "string",
  "productType": "Parfum | Vitamin | Sport | Cosmetic",
  // Для Parfum:
  "fullArticle": "string",
  "smallArticle": "string",
  "originFor": "string",
  "parfumesFor": "духи для мужчин | духи для женщин | унисекс",
  "smell": "string",
  "topNotes": "string",
  "heartNotes": "string",
  "baseNotes": "string",
  "imageLogo": "string",
  "imageBottle": "string",
  // Для Vitamin:
  "brand": "string",
  "nameRUS": "string",
  "nameENG": "string",
  "dose": "string"
}
```

**Ответ 201:** Объект товара

**Ответ 400:**
```json
{ "message": "Обязательные поля: article, name, categoryId" }
```

**Ответ 404:**
```json
{ "message": "Категория не найдена" }
```

---

#### GET `/product`

Получение списка всех товаров.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "article": "string",
    "name": "string",
    "categoryId": { "_id": "string", "name": "string" },
    "price": "number",
    "productType": "Parfum",
    "supplierId": { "_id": "string", "name": "string" }
  }
]
```

---

#### GET `/product/:id`

Получение товара по ID.

**Доступ:** Защищённый

**Ответ 200:**
```json
{
  "_id": "string",
  "article": "string",
  "name": "string",
  "categoryId": { "_id": "string", "name": "string" },
  "supplierId": { "_id": "string", "name": "string", "contactPerson": "string", "phone": "string" },
  "price": "number",
  "productType": "Parfum"
}
```

**Ответ 404:**
```json
{ "error": "Товар не найден" }
```

---

#### PATCH `/product/:id`

Обновление товара.

**Доступ:** Защищённый

**Тело запроса:** Любые поля товара для обновления

**Ответ 200:** Обновлённый объект товара

**Ответ 400:**
```json
{ "error": "Продукт с таким артикулом уже существует" }
```

**Ответ 404:**
```json
{ "error": "Товар не найден в базе" }
```

---

#### PATCH `/product/:id/archive`

Архивирование товара (мягкое удаление).

**Доступ:** Только администратор

**Ответ 200:**
```json
{
  "message": "Товар архивирован",
  "product": { ... }
}
```

---

#### GET `/product/search`

Полнотекстовый поиск товаров.

**Доступ:** Защищённый

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `query` | string | Поисковый запрос (required) |

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "article": "string",
    "score": "number"
  }
]
```

**Ответ 400:**
```json
{ "error": "Параметр query обязателен" }
```

---

#### GET `/product/supplier/:supplierId`

Получение товаров поставщика.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "supplier": "string"
  }
]
```

---

### Категории (`/category`)

#### POST `/category`

Создание новой категории.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "name": "string (required)",
  "parentId": "string (optional)"
}
```

**Ответ 201:** Объект категории

---

#### GET `/category`

Получение всех категорий.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "parentId": "string | null"
  }
]
```

---

#### GET `/category/tree`

Получение дерева категорий.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "children": []
  }
]
```

---

#### GET `/category/:id`

Получение категории по ID.

**Доступ:** Защищённый

**Ответ 200:** Объект категории

---

#### GET `/category/:id/products`

Получение товаров категории.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "categoryId": "string"
  }
]
```

---

#### PATCH `/category/:id`

Обновление категории.

**Доступ:** Защищённый

**Ответ 200:** Обновлённая категория

---

#### DELETE `/category/:id`

Удаление категории.

**Доступ:** Защищённый

**Ответ 200:**
```json
{ "message": "Категория удалена" }
```

---

### Поставщики (`/supplier`)

#### GET `/supplier`

Получение всех поставщиков.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "contactPerson": "string",
    "phone": "string",
    "email": "string"
  }
]
```

---

#### POST `/supplier`

Создание нового поставщика.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "name": "string (required)",
  "contactPerson": "string",
  "phone": "string",
  "email": "string",
  "address": "string"
}
```

**Ответ 201:** Объект поставщика

---

### Клиенты (`/customer`)

#### GET `/customer`

Получение всех клиентов.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "phone": "string",
    "email": "string"
  }
]
```

---

#### POST `/customer`

Создание нового клиента.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "name": "string (required)",
  "phone": "string",
  "email": "string",
  "address": "string",
  "gps": "string"
}
```

**Ответ 201:** Объект клиента

---

#### GET `/customer/:id`

Получение клиента по ID.

**Доступ:** Защищённый

**Ответ 200:** Объект клиента

---

#### PATCH `/customer/:id`

Обновление клиента.

**Доступ:** Защищённый

**Ответ 200:** Обновлённый клиент

---

#### DELETE `/customer/:id`

Удаление клиента.

**Доступ:** Защищённый

**Ответ 200:**
```json
{ "message": "Клиент удалён" }
```

---

### Склады (`/warehouse`)

#### GET `/warehouse`

Получение всех складов.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "address": "string",
    "capacity": "number"
  }
]
```

---

#### GET `/warehouse/:id`

Получение склада по ID.

**Доступ:** Защищённый

**Ответ 200:** Объект склада

---

#### POST `/warehouse`

Создание нового склада.

**Доступ:** Только администратор

**Тело запроса:**
```json
{
  "name": "string (required)",
  "address": "string",
  "capacity": "number"
}
```

**Ответ 201:** Объект склада

---

#### PATCH `/warehouse/:id`

Обновление склада.

**Доступ:** Администратор или назначенный менеджер

**Тело запроса:**
```json
{
  "name": "string",
  "address": "string",
  "capacity": "number"
}
```

**Ответ 200:** Обновлённый склад

---

#### DELETE `/warehouse/:id`

Удаление склада.

**Доступ:** Только администратор

**Ответ 200:**
```json
{ "message": "Склад удалён" }
```

---

### Адреса (`/address`)

#### GET `/address/:customerId`

Получение всех адресов клиента.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "customerId": "string",
    "address": "string",
    "gps": "string"
  }
]
```

---

#### POST `/address/:customerId`

Создание адреса для клиента.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "address": "string (required)",
  "gps": "string"
}
```

**Ответ 201:** Объект адреса

---

#### GET `/address/:id`

Получение адреса по ID.

**Доступ:** Защищённый

**Ответ 200:** Объект адреса

---

#### PATCH `/address/:customerId`

Обновление адресов клиента.

**Доступ:** Защищённый

**Тело запроса:**
```json
[
  {
    "_id": "string",
    "address": "string",
    "gps": "string"
  }
]
```

**Ответ 200:** Обновлённые адреса

---

#### DELETE `/address/:id`

Удаление адреса.

**Доступ:** Защищённый

**Ответ 200:**
```json
{ "message": "Адрес удалён" }
```

---

## Документооборот

### Документы (`/doc`)

#### POST `/doc`

Создание нового документа.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "doc": {
    "orderNum": "string",
    "docType": "OrderIn | OrderOut | Incoming | Outgoing | Transfer",
    "docDate": "date",
    "warehouseId": "string",
    "supplierId": "string (для OrderIn/Incoming)",
    "customerId": "string (для OrderOut/Outgoing)",
    "fromWarehouseId": "string (для Transfer)",
    "toWarehouseId": "string (для Transfer)",
    "bonusRef": "number",
    "summ": "number",
    "description": "string",
    "priority": "Low | Medium | High",
    "exchangeRate": "number (для Incoming)",
    "expenses": "number",
    "addressId": "string (для Outgoing)"
  },
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "unitPrice": "number",
      "bonusStock": "number",
      "batchId": "string"
    }
  ]
}
```

**Ответ 201:**
```json
{
  "doc": {
    "_id": "string",
    "docNum": "string",
    "docType": "OrderIn",
    "docStatus": "Draft",
    ...
  },
  "items": [...]
}
```

---

#### GET `/doc`

Получение всех документов.

**Доступ:** Защищённый

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `startDate` | date | Начальная дата |
| `endDate` | date | Конечная дата |

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "docNum": "string",
    "docType": "OrderIn",
    "docStatus": "Draft",
    "docDate": "date",
    "summ": "number",
    "warehouseId": { ... },
    "supplierId": { ... },
    "customerId": { ... }
  }
]
```

---

#### GET `/doc/:id`

Получение документа по ID с позициями.

**Доступ:** Защищённый

**Ответ 200:**
```json
{
  "doc": {
    "_id": "string",
    "docNum": "string",
    "docType": "OrderIn",
    "docStatus": "Draft",
    ...
  },
  "items": [
    {
      "_id": "string",
      "productId": {
        "_id": "string",
        "name": "string",
        "categoryId": { ... }
      },
      "quantity": "number",
      "unitPrice": "number",
      "batchId": { ... }
    }
  ]
}
```

**Ответ 404:**
```json
{ "error": "Документ не найден" }
```

---

#### PATCH `/doc/:id`

Обновление документа.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "doc": { ... },
  "items": [ ... ]
}
```

**Ответ 200:**
```json
{
  "doc": { ... },
  "items": [ ... ]
}
```

---

#### PATCH `/doc/:id/status`

Обновление статуса документа.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "status": "Draft | InProgress | InDelivery | Completed | Canceled | Reserved | Shipped | Delivered | TransitHub | InTransitDestination | Received"
}
```

**Ответ 200:**
```json
{
  "success": true,
  "doc": { ... }
}
```

**Ответ 400:**
```json
{ "error": "Недопустимый переход статуса" }
```

---

#### DELETE `/doc/:id`

Удаление документа.

**Доступ:** Только администратор

**Ответ 200:**
```json
{ "message": "Документ удалён" }
```

**Ответ 400:**
```json
{ "message": "Удалить можно только документ в статусе 'Draft' или 'Canceled'" }
```

---

#### GET `/doc/status/:status`

Получение документов по статусу.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "customerId": "string",
    "customerName": "string",
    "docs": [
      {
        "_id": "string",
        "docNum": "string",
        "items": [...],
        "docTotalQty": "number",
        "docTotalBonus": "number",
        "docTotalSum": "number"
      }
    ],
    "totalPositions": "number",
    "totalBonus": "number",
    "totalSum": "number"
  }
]
```

---

### Позиции документов (`/doc-items`)

#### POST `/doc-items`

Добавление позиции в документ.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "docId": "string",
  "productId": "string",
  "quantity": "number",
  "unitPrice": "number",
  "bonusStock": "number",
  "batchId": "string"
}
```

**Ответ 201:** Объект позиции

---

#### DELETE `/doc-items/:id`

Удаление позиции из документа.

**Доступ:** Защищённый

**Ответ 200:**
```json
{ "message": "Позиция удалена" }
```

---

### Партии (`/batch`)

#### POST `/batch`

Создание новой партии.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "productId": "string",
  "quantity": "number",
  "batchNumber": "string",
  "productionDate": "date",
  "expiryDate": "date",
  "status": "string"
}
```

**Ответ 201:** Объект партии

---

#### GET `/batch/:id`

Получение партии по ID.

**Доступ:** Защищённый

**Ответ 200:** Объект партии

---

#### GET `/batch/product/:productId`

Получение всех партий товара.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "productId": "string",
    "batchNumber": "string",
    "quantity": "number",
    "status": "string"
  }
]
```

---

#### PATCH `/batch/:id/status`

Обновление статуса партии.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "status": "string"
}
```

**Ответ 200:** Обновлённая партия

---

### История цен (`/price-history`)

#### GET `/price-history`

Получение всей истории цен.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "productId": "string",
    "price": "number",
    "startDate": "date",
    "endDate": "date | null"
  }
]
```

---

#### POST `/price-history`

Создание записи истории цен.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "productId": "string",
  "price": "number",
  "startDate": "date",
  "endDate": "date"
}
```

**Ответ 201:** Объект истории цен

---

### Транзакции (`/transaction`)

#### POST `/transaction`

Создание транзакции.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "type": "income | expense | adjustment",
  "productId": "string",
  "quantity": "number",
  "warehouseId": "string",
  "docId": "string",
  "description": "string"
}
```

**Ответ 201:** Объект транзакции

---

#### GET `/transaction/:id`

Получение транзакций по товару.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "type": "income",
    "productId": "string",
    "quantity": "number",
    "warehouseId": "string",
    "docId": "string",
    "createdAt": "date"
  }
]
```

---

## Складские операции

### Остатки (`/inventory`)

#### GET `/inventory/warehousebatch/:warehouseId`

Остатки на складе с партиями (включая нулевые).

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "productId": { ... },
    "warehouseId": "string",
    "batchId": { ... },
    "quantity": "number"
  }
]
```

---

#### GET `/inventory/warehousebatchnotnull/:warehouseId`

Остатки на складе с партиями (без нулевых).

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "productId": { ... },
    "warehouseId": "string",
    "batchId": { ... },
    "quantity": "number"
  }
]
```

---

#### GET `/inventory/warehouse/:warehouseId`

Остатки на складе.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "productId": { ... },
    "warehouseId": "string",
    "quantity": "number"
  }
]
```

---

#### GET `/inventory/warehousenotnull/:warehouseId`

Остатки на складе (без нулевых).

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "productId": { ... },
    "warehouseId": "string",
    "quantity": "number"
  }
]
```

---

#### GET `/inventory/product/:productId`

Остатки товара на всех складах.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "productId": "string",
    "warehouseId": { ... },
    "quantity": "number"
  }
]
```

---

#### PATCH `/inventory/adjust`

Ручное обновление остатков (инвентаризация).

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "productId": "string",
  "warehouseId": "string",
  "quantity": "number",
  "batchId": "string"
}
```

**Ответ 200:** Обновлённые остатки

---

## Доставка

### Документы доставки (`/delivery`)

#### GET `/delivery`

Получение всех документов доставки.

**Доступ:** Защищённый

**Ответ 200:**
```json
[
  {
    "_id": "string",
    "docId": "string",
    "deliveryDate": "date",
    "status": "string",
    "items": [...]
  }
]
```

---

#### GET `/delivery/:deliveryId`

Получение документа доставки по ID.

**Доступ:** Защищённый

**Ответ 200:** Объект доставки

---

#### POST `/delivery`

Создание документа доставки.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "docId": "string",
  "deliveryDate": "date",
  "items": [
    {
      "productId": "string",
      "quantity": "number"
    }
  ]
}
```

**Ответ 201:** Объект доставки

---

#### PUT `/delivery/:deliveryId`

Полное обновление доставки.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "docId": "string",
  "deliveryDate": "date",
  "status": "string",
  "items": [...]
}
```

**Ответ 200:** Обновлённая доставка

---

#### PATCH `/delivery/:deliveryId`

Частичное обновление позиций доставки.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "items": [...]
}
```

**Ответ 200:** Обновлённая доставка

---

#### DELETE `/delivery/:deliveryId`

Удаление документа доставки.

**Доступ:** Защищённый

**Ответ 200:**
```json
{ "message": "Доставка удалена" }
```

---

## Файлы

### Загрузка файлов (`/upload`)

#### POST `/upload`

Загрузка файла.

**Доступ:** Защищённый

**Content-Type:** `multipart/form-data`

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `file` | file | Файл для загрузки |

**Ответ 200:**
```json
{
  "filename": "string",
  "path": "string",
  "url": "string"
}
```

---

#### DELETE `/upload`

Удаление файла.

**Доступ:** Защищённый

**Тело запроса:**
```json
{
  "filename": "string"
}
```

**Ответ 200:**
```json
{ "message": "Файл удалён" }
```

---

## Коды ответов

| Код | Описание |
|-----|----------|
| `200` | Успешный запрос |
| `201` | Ресурс создан |
| `400` | Ошибка валидации / Недопустимый запрос |
| `401` | Неавторизованный доступ / Токен просрочен |
| `403` | Доступ запрещён |
| `404` | Ресурс не найден |
| `500` | Внутренняя ошибка сервера |

---

## Форматы ошибок

```json
{
  "error": "string"
}
```

или

```json
{
  "message": "string"
}
```

или

```json
{
  "error": "string",
  "details": { ... }
}
```

---

*Документ сгенерирован: 25 марта 2026 г.*
