# Warehouse WMS — контекст для Claude Code

## Архитектура

Монорепо (npm workspaces):
```
warehouse/
  interfaces/   — общие TypeScript-интерфейсы и DTO (shared между server и web)
  config/       — константы: DocType, статусы, маппы иконок/цветов
  server/       — Node.js + Express 5 + Mongoose 8 + TypeScript
  web/          — React 19 + Vite 7 + React Router 7 + TypeScript
  client/       — старый React Native клиент (не трогать)
  sinc/         — синхронизация данных через email (вспомогательный)
```

## Стек

- **Backend**: Express 5.1, MongoDB + Mongoose 8.14, JWT-аутентификация, express-validator
- **Frontend**: React 19.2.7, React Router 7, react-icons 5
- **Тесты**: Vitest 4 (server + web)
- **TypeScript**: 5.8 (server), 5.9 (web)

## Ветка разработки

Активная ветка: `claude/full-analysis-dutvpa`

## Модели данных (MongoDB)

| Коллекция   | Назначение |
|-------------|-----------|
| Doc         | Документы (Incoming/OrderIn/OrderOut/Transfer/Outgoing) |
| DocItems    | Позиции документов |
| Batch       | Партии товара (создаются при Delivered) |
| Inventory   | Остатки: batchId + warehouseId + quantityAvailable + quantityReserved |
| Transaction | Лог движений: Приход / Расход / Перемещение |
| Product     | Товары |
| Supplier    | Поставщики |
| Customer    | Клиенты |
| Warehouse   | Склады |
| Account     | Финансовые записи |

## Типы документов и их статус-машины

### Incoming (Приход товара)
```
Draft → Shipped → TransitHub → InTransitDestination → Delivered → Canceled
```
- **Delivered**: создаёт Batch + Inventory + Transaction('Приход') для каждого DocItem
- **Canceled** из Delivered: откатывает транзакции, удаляет Batch и Inventory
- До Delivered — DocItems хранятся без влияния на остатки

### OrderOut (Заказ на отгрузку)
```
Draft → InProgress (резерв) → InDelivery → Completed (списание) → Canceled (снятие резерва)
```
- InProgress: резервирует товар (quantityAvailable → quantityReserved) по FIFO
- Completed: списывает с резерва, создаёт Transaction('Расход')
- Canceled из InProgress/InDelivery: снимает резерв
- Canceled из Completed: откатывает списание

### OrderIn (Заказ поставщику)
Только смена статуса, без изменения остатков.

### Transfer (Перемещение)
Только смена статуса (логика не реализована).

### Outgoing (устаревший тип)
Оставлен в сервере для обратной совместимости. Удалён из web-интерфейса.

## Бизнес-правила (ВАЖНО!)

### Безопасность
- `JWT_SECRET` — обязателен в env, без fallback-значения (`server/src/middlewares/authMiddleware.ts`)
- `role` при регистрации всегда принудительно `'user'` (задаётся только сервером)
- CORS — белый список через `CORS_ORIGINS` в `.env` (через запятую)
- `adminMiddleware` всегда идёт ПОСЛЕ `authMiddleware`

### Инвентарь (FIFO)
- Резервирование и списание — по сроку годности (ближайший expiry первым)
- Inventory: `quantityAvailable` + `quantityReserved` (итого = сумма двух)
- Batch создаётся только при `Incoming → Delivered`

## Ключевые сервисы (server/src/services/)

| Сервис | Назначение |
|--------|-----------|
| `StatusService` | Все переходы статусов; вся бизнес-логика резерва/списания/прихода |
| `InventoryService` | CRUD инвентаря; метод `create(batchId, warehouseId, qty)` |
| `TransactionService` | Лог транзакций |
| `DocService` | Агрегация документов по статусу |

## Паттерны кода

### Алиасы путей (server)
```typescript
import { DocModel, InventoryModel, BatchModel } from '@models';
import { InventoryService } from '@services';
import { DocStatusOrderName } from '@warehouse/config';
```

### Алиасы (web)
```typescript
import type { DocDto } from '@warehouse/interfaces/DTO';
import { DocTypeMap } from '@warehouse/config';
```

### Маппинг DTO → Domain (web)
`web/src/api/mappers/docMappers.ts` — `dtoToDoc()` и `dtoItemToDocItem()`

### Форма документа (web)
```
DocScreen.tsx        — список документов + фильтры
DocForm.tsx          — контейнер формы (управляет состоянием)
HeaderForm.tsx       — шапка документа (тип, поставщик/клиент, статус)
EditableItem.tsx     — строка позиции (товар, кол-во, цена, скидка, expDate)
StatusIcon.tsx       — кнопка смены статуса
```

### Роутер (web)
```
docFormLoader.ts     — загрузка/инициализация документа (читает docType из URL)
docFormAction.ts     — сохранение/удаление документа
```

## Что реализовано в сессии claude/full-analysis-dutvpa

### Сервер
- [x] `StatusService.handleOrderOutStatusChange` — полный цикл резерв/списание/откат
- [x] `StatusService.handleIncomingStatusChange` — создание Batch+Inventory+Transaction при Delivered; откат при Canceled
- [x] `docItemsController.addItem` — для Incoming сохраняет только DocItem без инвентаря
- [x] `docModel` — исправлены required-валидаторы (customerId для OrderOut, supplierId для Incoming/OrderIn)
- [x] `docItemsModel` — добавлено поле `expirationDate`
- [x] `TransactionService` — переписан полностью
- [x] `DocService` — новый (агрегация по статусу)
- [x] Валидаторы (`middlewares/validators.ts`) — docValidators, productValidators
- [x] Безопасность: helmet, CORS whitelist, JWT без fallback, роль не из запроса
- [x] Роутеры: исправлен порядок маршрутов, добавлена валидация

### Web
- [x] Outgoing удалён из UI (оставлен в сервере для совместимости)
- [x] `docMappers.ts` — `OrderIn` корректно маппит supplierId (не customerId)
- [x] `HeaderForm` — case `OrderIn` (поставщик), case `Incoming` (поставщик + склад)
- [x] `EditableItem` — поле `expirationDate` для Incoming
- [x] `DocForm` — пробрасывает `docType` в EditableItem
- [x] `docFormLoader` — читает `docType` из URL при создании нового документа
- [x] `docFormAction` — валидация по типу документа (не только customerId)
- [x] `DocScreen` — кнопка создания для Incoming/OrderIn/OrderOut

### Интерфейсы
- [x] `IDocItem.expirationDate?: Date`
- [x] `DocItemDto.expirationDate?: string` (omit Date из base)

## Что НЕ реализовано (TODO)

- [ ] `handleTransferStatusChange` — перемещение между складами (заглушка)
- [ ] `handleOrderInStatusChange` — что происходит при Delivered (конвертация в Incoming?)
- [ ] Тесты: `StatusService.test.ts`, `InventoryService.test.ts`, `validators.test.ts`
- [ ] `sinc/` — очищен до ~280 строк, но логика импорта не верифицирована
- [ ] Rate limiting на все роуты (сейчас только `/auth`)
- [ ] Экран остатков `StockWarehouse` — проверить отображение после Incoming → Delivered

## Переменные окружения (server/.env)

```env
BD_NAME_WAREHOUSE=...
BD_TOKEN=mongodb+srv://...
JWT_SECRET=...          # обязателен, нет fallback
PORT=5001
CORS_ORIGINS=http://localhost:5173,http://192.168.50.100:5173
```

## Запуск

```bash
# Сервер
npm run dev --workspace=server   # или: cd server && npm run dev

# Web
npm run dev --workspace=web      # или: npm run web (из корня)
```
