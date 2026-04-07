//Основные интерфейсы WareHouse
//Справочники
export type * from './ICategory.js'                     //Категории
export type * from './IProduct.js'                      //Товары
export type * from './ISupplier.js'                     //Поставщики
export type * from './IUser.js'                         //Пользователи
export type * from './IWarehouse.js'                    //Склады
export type * from './ICustomer.js'                     //Клиенты
export type * from "./IAddress.js"                      //Адрес

//Изменение статусов
export type * from './IBatch.js'                        //Партии
export type * from './IInventory.js'                    //Остатки
export type * from './ITransaction.js'                  //Транзакции

//Screens
//DocScreen
export type * from './IDoc.js'                          //Документ
export type * from './IDocNum.js'                       //Номера документов  
//DocFormScreen
export type * from './IDocItem.js'                      //Позиции документа

//DeliveryScreen
export type * from './IDeliveryDoc.js'                  //Доставка
export type * from './IDeliveryItem.js'                 //Позиции доставки

export type * from './IPayment.js'                      //Платежи

//Журналы
export type * from './IPriceHistory.js'                 //История цен
export type * from './IAuditLog.js'                     //Журнал аудита
export type * from './IAccount.js'                      //Счета
export type * from './ILocation.js'                     //Местоположения
export type * from './INotification.js'                 //Уведомления
export type * from './IPackaging.js'                    //Упаковка


//Популированные интерфейсы
export type * from './IPopulatedOrder.js'               //Популированные заказы
export type * from './IPopulatedOrderItem.js'           //Популированные позиции заказа
export type * from './IPopulatedInventory.js'           //Популированные остатки
export type * from './IPopulatedProductInventory.js'    //Популированные остатки по товарам

//Параметры импорта
export type * from './IExcelImportParams.js'            //Параметры импорта из Excel
