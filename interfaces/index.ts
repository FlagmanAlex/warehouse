//Основные интерфейсы WareHouse
//Справочники
export * from './ICategory'                     //Категории
export * from './IProduct'                      //Товары
export * from './ISupplier'                     //Поставщики
export * from './IUser'                         //Пользователи
export * from './IWarehouse'                    //Склады
export * from './ICustomer'                     //Клиенты
export * from "./IAddress"                      //Адрес

//Изменение статусов
export * from './IBatch'                        //Партии
export * from './IInventory'                    //Остатки
export * from './ITransaction'                  //Транзакции

//Screens
//DocScreen
export * from './IDoc'                          //Документ
export * from './IDocNum'                       //Номера документов  
//DocFormScreen
export * from './IDocItem'                      //Позиции документа

//DeliveryScreen
export * from './IDeliveryDoc'                  //Доставка
export * from './IDeliveryItem'                 //Позиции доставки

export * from './IPayment'                      //Платежи

//Журналы
export * from './IPriceHistory'                 //История цен
export * from './IAuditLog'                     //Журнал аудита
export * from './IAccount'                      //Счета
export * from './ILocation'                     //Местоположения
export * from './INotification'                 //Уведомления
export * from './IPackaging'                    //Упаковка


//Популированные интерфейсы
export * from './IPopulatedOrder'               //Популированные заказы
export * from './IPopulatedOrderItem'           //Популированные позиции заказа
export * from './IPopulatedInventory'           //Популированные остатки
export * from './IPopulatedProductInventory'    //Популированные остатки по товарам

//Параметры импорта
export * from './IExcelImportParams'            //Параметры импорта из Excel
