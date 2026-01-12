//Основные интерфейсы WareHouse
//Справочники
export type * from './ICategory'                     //Категории
export type * from './IProduct'                      //Товары
export type * from './ISupplier'                     //Поставщики
export type * from './IUser'                         //Пользователи
export type * from './IWarehouse'                    //Склады
export type * from './ICustomer'                     //Клиенты
export type * from "./IAddress"                      //Адрес

//Изменение статусов
export type * from './IBatch'                        //Партии
export type * from './IInventory'                    //Остатки
export type * from './ITransaction'                  //Транзакции

//Screens
//DocScreen
export type * from './IDoc'                          //Документ
export type * from './IDocNum'                       //Номера документов  
//DocFormScreen
export type * from './IDocItem'                      //Позиции документа

//DeliveryScreen
export type * from './IDeliveryDoc'                  //Доставка
export type * from './IDeliveryItem'                 //Позиции доставки

export type * from './IPayment'                      //Платежи

//Журналы
export type * from './IPriceHistory'                 //История цен
export type * from './IAuditLog'                     //Журнал аудита
export type * from './IAccount'                      //Счета
export type * from './ILocation'                     //Местоположения
export type * from './INotification'                 //Уведомления
export type * from './IPackaging'                    //Упаковка


//Популированные интерфейсы
export type * from './IPopulatedOrder'               //Популированные заказы
export type * from './IPopulatedOrderItem'           //Популированные позиции заказа
export type * from './IPopulatedInventory'           //Популированные остатки
export type * from './IPopulatedProductInventory'    //Популированные остатки по товарам

//Параметры импорта
export type * from './IExcelImportParams'            //Параметры импорта из Excel
