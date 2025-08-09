import { IExcelImportParams } from '../../interfaces/IExcelImportParams';
import dotenv from 'dotenv'
dotenv.config()
import mongoose, { Types } from 'mongoose'
import { readExcelRangeToJSon, writeExcel } from './utils/excel';
import { IUser } from '../../interfaces/IUser';
import { UserModel } from './models/userModel';
import { ICustomer } from '../../interfaces/ICustomer';
import { ICategory } from '../../interfaces/ICategory';
import { IProduct } from '../../interfaces/IProduct';
import { ProductModel } from './models/productModel';
import { ISupplier } from '../../interfaces/ISupplier';
import { PriceHistoryModel } from './models/priceHistoryModel';
import { OrderModel } from './models/orderModel';
import { BatchModel } from './models/batchModel';
import { InventoryModel } from './models/inventoryModel';
import { OrderDetailsModel } from './models/orderDetailsModel';
import { IWarehouse } from '../../interfaces/IWarehouse';
import { SupplierModel } from './models/supplierModel';
import { CustomerModel } from './models/customerModel';
import { CategoryModel } from './models/categoryModel';
import { WarehouseModel } from './models/warehouseModel';
import { TransactionModel } from './models/transactionModel';
import { OrderNumModel } from './models/orderNumModel';

interface IJournal {
    '№ заказа': string
    '№ отслеживания': string
    'Поставщик': string
    'Статус': string
    'ДатаЗ': string
    'Группа': string
    'Артикул': string
    'Бренд': string
    'Наименование': string
    'Цена закупки': number
    'Bonus': number
    'Вознаграждение': number
    'Разница в оплате': number
    'Логистика': number
    'Итоговая цена RUB': number
    'Продажа RUB': number
    'ДатаП': string
    'Клиент': string
    'Чистая прибыль RUB': number
    '% наценки': number
}
interface IHeadJournal {
    '№ заказа': string
    '№ отслеживания': string
    'Поставщик': string
    'Статус доставки': string
    'Перевозчик': string
    '№ отслеживания перевозчика': string
    'Дата заказа': string
    'Курс': number
    'Вознаграждение UAH': number
    'Общий итог iHerb UAH': number
    'Сумма оплаты факт USD': number
    'Логистика RUB': number
    'Итого закупка RUB': number
    'Итого продажа RUB': number
    'Чистая прибыль RUB': number
    '% наценки': number
}
interface IClient {
    name: string
    phone: string
    address: string
    gps: string
    percent: number

}

class Database {
    private static instance: Database
    private readonly url: string
    private readonly dbName: string
    constructor() {
        const BD_TOKEN = process.env.BD_TOKEN;
        const BD_NAME = process.env.BD_NAME_WAREHOUSE

        if (!BD_TOKEN || !BD_NAME) {
            throw new Error('Токен или имя базы данных не найдены...');
        }

        this.url = BD_TOKEN
        this.dbName = BD_NAME
    }
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }
    async connect() {
        try {
            await mongoose.connect(this.url, { dbName: this.dbName })
            console.log(`✅ Успешное подключение к базе ${this.dbName}`);

        } catch (error) {
            console.log(`❌ Ошибка подключения к базе ${this.dbName}`);
            process.exit(1)
        }
    }
    async disconnect() {
        try {
            await mongoose.disconnect()
            console.log(`☑️ Соединение с базой ${this.dbName} закрыто`);
        } catch (error) {
            console.log(`❌ Ошибка при закрытии соединения с базой ${this.dbName}`);
        }
    }
}

class ImportExcel {
    private startTime = performance.now()
    private server = `${process.env.HOST}:${process.env.PORT}`
    private headJournal: IHeadJournal[] = []
    private journal: IJournal[] = []
    private clients: IClient[] = []
    private userId = new Types.ObjectId
    private token = ''
    private fileName = `./temp-${new Date().toLocaleDateString()}`
    private categoryMap: Map<string, string> = new Map()
    private warehouseMap: Map<string, string> = new Map()
    private supplierMap: Map<string, string> = new Map()
    private productMap: Map<string, string> = new Map()
    private customerMap: Map<string, string> = new Map()

    private paramsExcel = {
        fileName: '../iHerbРасчетЗатрат.xlsx',
        fieldsName: [],
    }
    private paramsHeadJournal: IExcelImportParams = {
        ...this.paramsExcel,
        sheetName: 'HeadJournal',
        range: 'A1:P1000',
    }
    private paramsJournal: IExcelImportParams = {
        ...this.paramsExcel,
        sheetName: 'Journal',
        range: 'A1:V10000',
    }
    private paramsClient: IExcelImportParams = {
        ...this.paramsExcel,
        sheetName: 'Clients',
        range: 'A1:E500',
    }

    public async init() {
        await this.importUser()
        await this.getJournal()
        await this.getHeadJournal()
        await this.getClient()
    }
    private getTime() {
        const seconds = (performance.now() - this.startTime) / 1000
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60)
        return `${h}ч.${m}м.${s}с.`;
    }
    private async fetchApi(
        url: string,
        method: 'POST' | 'PUTCH' | 'GET' | 'DELETE',
        token: string,
        body: Object
    ) {
        try {
            const requestOptions: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            }

            // Добавляем body только если он есть и метод != 'GET'
            if (body && method !== 'GET') {
                requestOptions.body = JSON.stringify(body)
            }
            const response = await fetch(`${this.server}/api/${url}`, requestOptions)

            if (!response.ok) {
                throw Error('❌ Ошибка выполнения запроса fetchApi')
            }
            const data = await response.json()

            return data
        } catch (error) {
            console.log(`❌ Ошибка выполнения запроса ${url}`)
            console.log('Тело запроса:', body);
        }
    }
    private async importUser() {
        try {
            // Удаляем User перед созданием
            await UserModel.deleteMany({});

            const createUser: IUser = {
                username: 'Flagman',
                password: '2816509017',
                email: 'flagman25@mail.ru',
                role: 'admin'
            }
            const data = await this.fetchApi('auth/register', 'POST', this.token, createUser)

            this.userId = data.user._id
            this.token = data.token
            console.log('Создание коллекции User прошло успешно');

        } catch (error) {
            console.log('Ошибка создания коллекции User', (error as Error).message);

        }
    }
    private async getJournal() {
        const importJ = await readExcelRangeToJSon(this.paramsJournal)
        this.journal = importJ
            .filter(item => item['№ заказа'])
            .map(item => ({
                "№ заказа": item["№ заказа"],
                "№ отслеживания": item["№ отслеживания"]?.result || item["№ отслеживания"],
                'Поставщик': item["Поставщик"]?.result || item["Поставщик"],
                'Статус': item["Статус"]?.result || item["Статус"],
                'ДатаЗ': item["ДатаЗ"]?.result || item["ДатаЗ"],
                'МесяцЗ': item["МесяцЗ"]?.result || item["МесяцЗ"],
                'Группа': item["Группа"]?.result || item["Группа"],
                'Артикул': item["Артикул"]?.result || item["Артикул"],
                'Бренд': item["Бренд"]?.result || item["Бренд"],
                'Наименование': item["Наименование"]?.result || item["Наименование"],
                "Цена закупки": item["Цена закупки"]?.result || item["Цена закупки"],
                'Bonus': item['Bonus']?.result || item["Bonus"],
                'Вознаграждение':
                    !(item["Вознаграждение"] instanceof Object) ? item["Вознаграждение"] :
                        item["Вознаграждение"]?.result || 0,
                "Разница в оплате": item["Разница в оплате"]?.result || item["Разница в оплате"],
                'Логистика': item["Логистика"]?.result || item["Логистика"],
                "Итоговая цена RUB": item["Итоговая цена RUB"]?.result || item["Итоговая цена RUB"],
                "Продажа RUB": item["Продажа RUB"]?.result || item["Продажа RUB"],
                'ДатаП': item["ДатаП"]?.result || item["ДатаП"],
                'Клиент': item["Клиент"]?.result || item["Клиент"],
                'МесяцП': item["МесяцП"]?.result || item["МесяцП"],
                "Чистая прибыль RUB": item["Чистая прибыль RUB"]?.result || item["Чистая прибыль RUB"],
                "% наценки": item["% наценки"]?.result || item["% наценки"],
            }))
    }
    private async getHeadJournal() {
        const hJ = await readExcelRangeToJSon(this.paramsHeadJournal);
        this.headJournal = hJ
            .filter(item => item['№ заказа'])
            .map(documment => ({
                "№ заказа": documment['№ заказа']?.text || documment['№ заказа'].toString(),
                "Дата заказа": documment['Дата заказа'] && !isNaN(Date.parse(documment['Дата заказа']))
                    ? new Date(documment['Дата заказа']).toISOString()
                    : '',
                'Поставщик': documment['Поставщик'] || '',
                "№ отслеживания": documment['№ отслеживания']?.text || documment['№ отслеживания'] || '',
                "Статус доставки": documment['Статус доставки'] || '',
                'Перевозчик': documment['Перевозчик'] || '',
                "№ отслеживания перевозчика": documment['№ отслеживания перевозчика']?.text || documment['№ отслеживания перевозчика'] || '',
                'Курс': documment['Курс']?.result || documment['Курс'] || 0,
                "Вознаграждение UAH": documment['Вознаграждение UAH']?.result || documment['Вознаграждение UAH'] || 0,
                "Сумма оплаты факт USD": documment['Сумма оплаты факт USD']?.result || documment['Сумма оплаты факт USD'] || 0,
                "Логистика RUB": documment['Логистика RUB']?.result || documment['Логистика RUB'] || 0,
                "% наценки": documment['% наценки']?.result || documment['% наценки'] || 0,
                "Итого закупка RUB": documment['Итого закупка RUB']?.result || documment['Итого закупка RUB'] || 0,
                "Итого продажа RUB": documment['Итого продажа RUB']?.result || documment['Итого продажа RUB'] || 0,
                "Общий итог iHerb UAH": documment['Общий итог iHerb UAH']?.result || documment['Общий итог iHerb UAH'] || 0,
                "Чистая прибыль RUB": documment['Чистая прибыль RUB']?.result || documment['Чистая прибыль RUB'] || 0,
            }));
    }
    private async getClient() {
        const importClients = await readExcelRangeToJSon(this.paramsClient);
        this.clients = importClients
            .filter(client => client.name)
            .map(client => ({
                name: typeof client.name === 'object' ?
                    client.name.text :
                    client.name,
                phone: typeof client.phone === 'object' ?
                    client.phone.text :
                    client.phone,
                address: client.address,
                gps: client.gps,
                percent: client.percent,
            }))
    }
    private async addSuppliers() {
        console.log('Создание коллекции Supplier...');
        await SupplierModel.deleteMany({})
        try {
            const supplier = this.headJournal.map((item) => (item['Поставщик']))

            const uniqueSupplier: { name: string, userId: Types.ObjectId }[] = supplier.reduce((acc, item) => {
                if (!acc.some((supp: { name: string }) => supp.name === item)) {
                    acc.push({
                        name: item,
                        userId: this.userId
                    })
                }
                return acc
            }, [] as { name: string, userId: Types.ObjectId }[])
            await Promise.all(uniqueSupplier.map(async (item) => await this.fetchApi(`supplier`, 'POST', this.token, item)))
        } catch (error) {
            console.log(error);
        }
        console.log('Создание коллекции Suppliers завершено');
    }
    private async addCustomers() {
        console.log('Создание коллекции Customer...');
        await CustomerModel.deleteMany({})
        //Загружаем данные клиентов
        try {
            const customer = this.clients.map((item) => (
                {
                    name: item.name,
                    address: item.address,
                    phone: item.phone,
                    gps: item.gps,
                    percent: item.percent,
                    accountManager: this.userId,
                }
            ))
            for (const [index, item] of customer.entries()) {
                await this.fetchApi(`customer`, 'POST', this.token, item)
                process.stdout.write(`\r 🔄️ Прогресс: ${index + 1}/${customer.length} (${Math.round(((index + 1) / customer.length) * 100)}%)     `)
            }
            // await Promise.all(customer.map(async (item) => await this.fetchApi(`customer`, 'POST', this.token, item)))
        } catch (error) {
            console.log(error);
        }
        console.log('Создание коллекции Customer завершено');
    }
    private async addWarehouse() {
        console.log('Создание коллекции Warehouse...');
        await WarehouseModel.deleteMany({})
        try {
            const uniqueWarehouse = Array.from(new Set(this.journal.map(item => item['Группа'])))
                .map(group => ({ name: group }))
                .filter(item => item.name !== undefined);
            uniqueWarehouse.push({ name: 'Транзит' });
            await Promise.all(uniqueWarehouse.map(async item => {
                const data = await this.fetchApi(`warehouse`, 'POST', this.token, { name: item.name, userId: this.userId })
            }))
        } catch (error) {
            console.log('Ошибка сервере', (error as Error).message);
        }
        console.log('Создание коллекции Warehouse завершено');
    }
    private async addCategory() {
        console.log('Создание коллекции Category...');
        await CategoryModel.deleteMany({})
        //Создание root категории и Получение rootId 
        try {
            const root = await this.fetchApi(`category`, 'POST', this.token, { name: 'Категории товаров' })
            const rootId = root._id

            //Получение уникальных значений из journals, создание массива категорий и запись в базу.
            const uniqueCategory: ICategory[] = Array.from(new Set(this.journal.map(item => item['Бренд'])))
                .filter(item => item)
                .map(item => ({ name: item, parentCategory: rootId }))

            await Promise.all(uniqueCategory.map(async item => {
                const data = await this.fetchApi(`category`, 'POST', this.token, item)
            }))
            console.log('Создание коллекции Category завершено');
        } catch (error) {
            console.log('Ошибка сервера', (error as Error).message);
        }
    }
    private async addProduct() {
        await ProductModel.deleteMany({})
        await PriceHistoryModel.deleteMany({})
        try {
            console.log('Начало addProduct');

            // 1. Получаем категории
            //------------------------------------------------------------------------------------
            const resCategory = await this.fetchApi(`category`, 'GET', this.token, {});

            const categories: ICategory[] = resCategory
            this.categoryMap = new Map(
                categories.map(item => {
                    if (!item._id) throw Error(`При создании categoryMap есть несуществующий идентификатор элемента ${item.name}`)
                    return [item.name, item._id]
                })
            );

            // 2. Получаем поставщиков
            //------------------------------------------------------------------------------------
            const suppliers: ISupplier[] = await this.fetchApi(`supplier`, 'GET', this.token, {})

            this.supplierMap = new Map(suppliers.map(item => {
                if (!item._id) throw Error(`При создании supplierMap есть несуществующий идентификатор элемента ${item.name}`)
                return [item.name, item._id]
            }))

            // 3. Формируем уникальные продукты
            //------------------------------------------------------------------------------------
            const seen = new Set()
            const uniqueProducts: any = []
            this.journal.forEach(journal => {
                if (
                    !journal['Бренд'] ||
                    !journal['Артикул'] ||
                    !journal['Наименование'] ||
                    !journal['Поставщик']
                ) return

                const categoryId = this.categoryMap.get(journal['Бренд']);
                const supplierId = this.supplierMap.get(journal['Поставщик']);

                if (!categoryId || !supplierId) {
                    throw new Error(`Ошибка в categoryId (${journal['Бренд']}) или supplierId (${journal['Поставщик']})`);
                }

                //Проверка на уникальность только по артикулу и наименованию
                const key = `${journal['Артикул']}-${journal['Наименование']}`

                //Создание уникальной таблицы продуктов
                if (!seen.has(key)) {
                    seen.add(key)
                    uniqueProducts.push({
                        article: journal['Артикул'].toString(),
                        name: journal['Наименование'],
                        // description: '',
                        categoryId,
                        unitOfMeasurement: 'шт',
                        price: 0,
                        isArchived: false,
                        createdBy: this.userId,
                        lastUpdateBy: this.userId,
                        supplierId,
                    })
                }
            })
            // 4. Создаем продукты с задержкой
            console.log('Cоздание коллекции Product...');
            const errorProducts = [];
            const totalProduct = uniqueProducts.length
            let processed = 0
            for (const [index, product] of uniqueProducts.entries()) {
                try {
                    const response = await this.fetchApi(`product`, 'POST', this.token, product)

                    if (!response) throw Error(`Ошибка создания продукта ${product.article} ${product.name}`)

                    processed++
                    process.stdout.write(`\r 🔄️ Прогресс: ${processed}/${totalProduct} (${Math.round((processed / totalProduct) * 100)}%)     `)
                    // console.log(`✅ Продукт ${index + 1}/${uniqueProducts.length} создан`);
                } catch (error) {
                    console.error(`❌ Ошибка при создании продукта ${index + 1}:`, (error as Error).message);
                    errorProducts.push(product);
                }
            }

            // 5. Записываем ошибки в Excel
            if (errorProducts.length > 0) {
                console.log(`Записываем ${errorProducts.length} ошибок в Excel...`);
                await writeExcel(errorProducts, `${this.fileName}.xlsx`, performance.now().toString());
                console.log('✅ Файл с ошибками сохранен');
            } else {
                console.log('✅ Все продукты успешно созданы');
            }

            return {
                total: uniqueProducts.length,
                success: uniqueProducts.length - errorProducts.length,
                errors: errorProducts.length,
                errorProducts
            };

        } catch (error) {
            console.error('❌ Критическая ошибка в addProduct:', error);
            throw error; // Пробрасываем ошибку выше для обработки
        }
    }
    private async InitialMap() {
        try {
            //------------------------------------------------------------------------------------
            console.log('Получаем список складов');
            const warehouse: IWarehouse[] = await this.fetchApi(`warehouse`, 'GET', this.token, {})

            console.log('Делаем warehouseMap');
            this.warehouseMap = new Map(warehouse.map(item => {
                if (!item._id) throw Error(`При создании warehouseMap есть несуществующий идентификатор элемента ${item.name}`)
                return [item.name, item._id]
            }))
            // 2. Получаем поставщиков
            //------------------------------------------------------------------------------------
            console.log('Получаем supplier');
            const suppliers: ISupplier[] = await this.fetchApi(`supplier`, 'GET', this.token, {})

            console.log('Делаем supplierMap');
            this.supplierMap = new Map(suppliers.map(item => {
                if (!item._id) throw Error(`При создании supplierMap есть несуществующий идентификатор элемента ${item.name}`)
                return [item.name, item._id]
            }))

            //------------------------------------------------------------------------------------
            console.log('Получаем product');
            const products: IProduct[] = await this.fetchApi(`product`, 'GET', this.token, {})

            console.log('Делаем productMap');
            this.productMap = new Map(products.map(item => {
                if (!item._id) throw Error(`При создании productMap есть несуществующий идентификатор элемента ${item.name}`)
                return [item.article, item._id]
            }))

            //------------------------------------------------------------------------------------
            console.log('Получаем customer');
            const customer: ICustomer[] = await this.fetchApi(`customer`, 'GET', this.token, {})

            console.log('Делаем customerMap');
            this.customerMap = new Map(customer.map(item => {
                if (!item._id) throw Error(`При создании customerMap есть несуществующий идентификатор элемента ${item.name}`)
                return [item.name, item._id]
            }))
            // console.log(this.customerMap);

            //------------------------------------------------------------------------------------
        } catch (error) {

        }
    }
    private async addOrderIn() {
        await OrderNumModel.deleteMany({})
        await BatchModel.deleteMany({})
        await InventoryModel.deleteMany({})
        await TransactionModel.deleteMany({})
        await OrderModel.deleteMany({})
        await OrderDetailsModel.deleteMany({})

        console.log('Начало addOrderIn');

        try {

            //Получаем все мапы
            await this.InitialMap()

        } catch (error) {
            console.log((error as Error).message);
        }

        for (const [index, item] of this.headJournal.entries()) {
            const supplierId = this.supplierMap.get(item['Поставщик'])
            const warehouseId = this.warehouseMap.get('Транзит')
            const order = {
                orderDate: new Date(item['Дата заказа']),
                docNum: item['№ заказа'],
                vendorCode: item['№ отслеживания'],
                orderType: 'Приход',
                exchangeRate: item['Курс'],
                bonusRef: item['Вознаграждение UAH'],
                expenses: item['Логистика RUB'],
                payment: item['Сумма оплаты факт USD'],
                status: 'Завершен',
                userId: this.userId,
                supplierId: supplierId,
                warehouseId: warehouseId,
                customerId: new Types.ObjectId()
            }
            // console.log('получаем массив orderItems по номеру заказа');
            const orderItems = this.journal
                .filter(journal => journal['№ заказа'].toString() === item['№ заказа'].toString())
                .map(item => (
                    {
                        productId: this.productMap.get(item['Артикул'].toString()),
                        quantity: 1,
                        unitPrice: item['Цена закупки'],
                        bonusStock: item.Bonus
                    }
                ))

            //Суммируем orderDetails по quantity и bonusStock
            const map = new Map()
            orderItems.forEach(item => {
                const exist = map.get(item.productId)
                if (exist) {
                    exist.quantity += item.quantity
                    exist.bonusStock += item.bonusStock
                } else map.set(item.productId, { ...item })
            })

            const detailsWithoutBatch = Array.from(map.values())
            const createOrder = {
                ...order,
                items: detailsWithoutBatch
            }
            try {
                const resOrder = await this.fetchApi('order', 'POST', this.token, createOrder)
                if (resOrder.message) console.log(resOrder.message);

                process.stdout.write(`\r🔄️ Создание заказа ${index} из ${this.headJournal.length} №${item['№ заказа']}  (${Math.round((index / this.headJournal.length) * 100)}%)     `)
            }
            catch (error) {
                console.log((error as Error).message);
            }


        }
    }
    //Создание расходных документов
    private async addOrderOut() {

        interface IDetailOrder {
            orderDate: Date,
            customerId: Types.ObjectId | undefined,
            supplierId: Types.ObjectId | undefined
            productId: Types.ObjectId | undefined,
            quantity: number,
            unitPrice: number,
            bonusStock: number,
            batchId: null,
            orderId: null,
        }
        interface IOrderAndOrderDetails {
            orderDate: Date
            orderType: string
            warehouseId: Types.ObjectId
            customerId: Types.ObjectId
            supplierId: Types.ObjectId
            userId: Types.ObjectId
            items: Array<{
                productId: Types.ObjectId | undefined
                quantity: number
                unitPrice: number
                bonusStock: number
            }>
        }

        await this.DeleteAllOrderOut()

        //Получаем все мапы
        await this.InitialMap()

        //получаем массив из уникальных документов из journalHead

        //1. групируем по ДатаП, Клиент, Артикул
        const ordersDetails = Object.values(this.journal
            .filter(item => {
                const { ДатаП, Клиент, Артикул } = item
                return !!ДатаП && !!Клиент && !!Артикул
            })
            .reduce((acc, item) => {
                const { ДатаП, Клиент, Артикул } = item
                const customerId = this.customerMap.get(Клиент)
                const productId = this.productMap.get(Артикул)
                const key = `${ДатаП}-${Клиент}-${Артикул}`
                if (!acc[key])
                    acc[key] = {
                        orderDate: new Date(ДатаП),
                        customerId: new Types.ObjectId(customerId), //customerId,
                        supplierId: new Types.ObjectId(),
                        productId: new Types.ObjectId(productId),
                        quantity: 0,
                        unitPrice: item['Продажа RUB'],
                        bonusStock: 0,
                        batchId: null,
                        orderId: null,
                    }
                acc[key].quantity += 1
                return acc
            }, {} as Record<string, IDetailOrder>)
        )

        //2. Групипруем по ДатаП, Клиент для создания заказов на дату по клиенту

        const orders = Object.values(ordersDetails.reduce((acc, item) => {
            const key = `${item.orderDate.toISOString()}-${item.customerId}`
            if (!acc[key]) {
                acc[key] = {
                    orderDate: item.orderDate,
                    customerId: item.customerId,
                    orderType: 'Расход',
                    supplierId: item.supplierId,
                    userId: this.userId,
                    warehouseId: this.warehouseMap.get('Транзит'),
                    items: [] as Array<{
                        productId: Types.ObjectId,
                        quantity: number,
                        bonusStock: number,
                        unitPrice: number,
                    }>
                } as unknown as IOrderAndOrderDetails
            }
            acc[key].items.push({
                productId: item.productId,
                quantity: item.quantity,
                bonusStock: 0,
                unitPrice: item.unitPrice
            })

            return acc

        }, {} as Record<string, IOrderAndOrderDetails>))

        // console.log(orders);

        for (const [index, order] of orders.entries()) {
            try {
                const saveOrder = await this.fetchApi('order', 'POST', this.token, order)
                process.stdout.write(`\r🔄️ Создание заказа ${index} из ${orders.length} (${Math.round((index / orders.length) * 100)}%)    `)
            } catch (error) {
                await writeExcel(Array(order), `${this.fileName}.xlsx`, 'OrderOut_Order')
                await writeExcel(Array(order.items), `${this.fileName}.xlsx`, 'OrderOut_OrderItems')
                console.log(`Ошибка при сохранении заказа`, error);

            }
        }
    }
    private async DeleteAllOrderOut() {
        try {
            // 1. Найти все расходные заказы
            const orders = await OrderModel.find({ orderType: 'Расход' });

            if (!orders.length) {
                console.log('Нет расходных заказов для удаления');
                return;
            }

            // 2. Получить массив ID этих заказов
            const orderIds = orders.map(order => order._id);

            // 3. Найти связанные позиции заказов
            const orderDetails = await OrderDetailsModel.find({
                orderId: { $in: orderIds }
            });

            // 4. Найти связанные транзакции
            const transactions = await TransactionModel.find({
                orderId: { $in: orderIds },
                transactionType: 'Расход'
            });

            // 5. Восстановить остатки по партиям
            for (const transaction of transactions) {
                const { productId, batchId, warehouseId, changeQuantity } = transaction;

                // Прибавляем обратно кол-во (т.к. это было списание)
                await InventoryModel.updateOne(
                    { productId, batchId, warehouseId },
                    { $inc: { quantityAvailable: Math.abs(changeQuantity) } }
                );
            }

            // 6. Удалить связанные данные
            await OrderDetailsModel.deleteMany({ orderId: { $in: orderIds } });
            await TransactionModel.deleteMany({ orderId: { $in: orderIds } });

            // 7. Удалить сами заказы
            await OrderModel.deleteMany({ _id: { $in: orderIds } });

            console.log(`Удалено ${orders.length} расходных заказов и восстановлены остатки`);
        } catch (error) {
            console.error('Ошибка при удалении расходных заказов:', error);
        }
    }
    public Main = async () => {
        const db = new Database()
        try {

            await db.connect()

            await this.init()

            await this.addSuppliers()
            await this.addCustomers()
            await this.addWarehouse()
            await this.addCategory()
            await this.addProduct()
            await this.addOrderIn()
            await this.addOrderOut()
            console.log(this.getTime())

        } finally {
            db.disconnect()
        }
    }
}

const createDB = new ImportExcel()
createDB.Main()


