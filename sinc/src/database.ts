import mongoose, { Types } from "mongoose";

export class Database {
    private static instance: Database;
    private readonly url: string;
    private readonly dbName: string;
    constructor() {
        const BD_TOKEN = process.env.BD_TOKEN;
        const BD_NAME = process.env.BD_NAME_WAREHOUSE;

        if (!BD_TOKEN || !BD_NAME) {
            throw new Error("Токен или имя базы данных не найдены...");
        }

        this.url = BD_TOKEN;
        this.dbName = BD_NAME;
    }
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        try {
            await mongoose.connect(this.url, { dbName: this.dbName });
            console.log(`✅ Успешное подключение к базе ${this.dbName}`);
        } catch (error) {
            console.log(`❌ Ошибка подключения к базе ${this.dbName}`);
            process.exit(1);
        }
    }
    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log(`☑️ Соединение с базой ${this.dbName} закрыто`);
        } catch (error) {
            console.log(
                `❌ Ошибка при закрытии соединения с базой ${this.dbName}`
            );
        }
    }
}