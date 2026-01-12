import dotenv from 'dotenv'
dotenv.config()
import mongoose, { Types } from 'mongoose'
// import { readExcelRangeToJSon, writeExcel } from './utils/excel';
import {
    IUser, ICustomer,
    ICategory, IProduct, ISupplier,
    IWarehouse, IExcelImportParams, IDoc,
    IDocItem,
    IDocIncoming,
    IDocOutgoing,
    IAddress,
} from '@warehouse/interfaces';
// import { CreateDocDto, CreateProductDto, CreateDocItemDto, CreateSupplierDto, CreateCustomerDto, CreateWarehouseDto, CreateCategoryDto, ResponseWarehouseDto, ResponseSupplierDto, ResponseProductDto, ResponseCustomerDto } from "@interfaces/DTO";
// import {
//     UserModel, ProductModel, PriceHistoryModel,
//     DocModel, BatchModel, InventoryModel,
//     DocItemsModel, SupplierModel, CustomerModel,
//     CategoryModel, WarehouseModel, TransactionModel, DocNumModel,
//     ITransactionModel,
// } from '@models';

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
    private server: string = `${process.env.HOST}:${process.env.PORT}`
    private clients: ICustomer[] = []
    private userId: string = ''
    private token: string = ''
    private fileName: string = `./temp-${new Date().toLocaleDateString()}`

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
    private getTime() {
        const seconds = (performance.now() - this.startTime) / 1000
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60)
        return `${h}ч.${m}м.${s}с.`;
    }
    private async authUser() {
        try {

            const user = {
                email: 'flagman25@mail.ru',
                password: '2816509017',
            }
            const data = await this.fetchApi('auth/login', 'POST', this.token, user)

            this.userId = data.user._id
            this.token = `Bearer ${data.token}`
            console.log('Авторизация пользователя прошла успешно');

        } catch (error) {
            console.log('Ошибка авторизации пользователя', (error as Error).message);

        }
    }

    public Main = async () => {
        const db = new Database()
        try {

            await db.connect()
            await this.authUser()
            const customers = await this.fetchApi('customer', 'GET', this.token, {})
            customers.forEach(async (customer: ICustomer) => {
                const newAddress: IAddress = {
                    main: true,
                    address: customer.address || '',
                    customerId: customer._id || '',
                    gps: customer.gps || '',
                    description: customer.description || '',
                }
                await this.fetchApi('address', 'POST', this.token, newAddress)
            })
            console.log(customers);


            console.log(this.getTime())

        } finally {
            db.disconnect()
        }
    }
}

const createDB = new ImportExcel()
createDB.Main()


