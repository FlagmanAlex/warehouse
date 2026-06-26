import dotenv from 'dotenv';
dotenv.config();

import { readExcelRangeToJSon, writeExcel } from "./excel.js";
import {
    ICustomer,
    ICategory,
    IProduct,
    ISupplier,
    IWarehouse,
    IExcelImportParams,
} from "@warehouse/interfaces";
import { ProductTypeRus, ProductTypeRusMap } from "@warehouse/config";
import { fetchApi } from "./fetchApi.js";
import { IHeadJournal } from "./interfaces/IHeadJournal.js";
import { IJournal } from "./interfaces/IJournal.js";

class SincExcel {
    private startTime = performance.now();
    private headJournal: IHeadJournal[] = [];
    private journal: IJournal[] = [];
    private userId: string = "";
    private token: string = "";
    private fileName: string = `./temp-${new Date().toLocaleDateString()}`;
    private categoryMap: Map<string, string> = new Map();
    private warehouseMap: Map<string, string> = new Map();
    private supplierMap: Map<string, string> = new Map();
    private productMap: Map<string, string> = new Map();

    private paramsExcel = {
        fileName: "../iHerbРасчетЗатрат.xlsx",
        fieldsName: [],
    };
    private paramsHeadJournal: IExcelImportParams = {
        ...this.paramsExcel,
        sheetName: "HeadJournal",
        range: "A1:P1000",
    };
    private paramsJournal: IExcelImportParams = {
        ...this.paramsExcel,
        sheetName: "Journal",
        range: "A1:V10000",
    };
    private paramsClient: IExcelImportParams = {
        ...this.paramsExcel,
        sheetName: "Clients",
        range: "A1:E500",
    };

    public async init() {
        await this.authUser();
        await this.getJournal();
        await this.getHeadJournal();
        console.log("✅ Импорт данных из Excel завершен");
    }

    private getDeltaTime() {
        const seconds = (performance.now() - this.startTime) / 1000;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}ч.${m}м.${s}с.`;
    }

    private async authUser() {
        const email = process.env.SINC_EMAIL;
        const password = process.env.SINC_PASSWORD;
        if (!email || !password) {
            throw new Error('SINC_EMAIL и SINC_PASSWORD должны быть заданы в .env');
        }
        try {
            const data = await fetchApi("auth/login", "POST", this.token, { email, password });
            this.userId = data.user._id;
            this.token = `Bearer ${data.token}`;
            console.log("Авторизация прошла успешно");
        } catch (error) {
            throw new Error(`Ошибка авторизации: ${(error as Error).message}`);
        }
    }

    private async getJournal() {
        const importJ = await readExcelRangeToJSon(this.paramsJournal);
        this.journal = importJ
            .filter((item) => item["№ заказа"])
            .map((item) => ({
                "№ заказа": item["№ заказа"],
                "№ отслеживания": item["№ отслеживания"]?.result || item["№ отслеживания"],
                Поставщик: item["Поставщик"]?.result || item["Поставщик"],
                Статус: item["Статус"]?.result || item["Статус"],
                ДатаЗ: item["ДатаЗ"]?.result || item["ДатаЗ"],
                МесяцЗ: item["МесяцЗ"]?.result || item["МесяцЗ"],
                Группа: item["Группа"]?.result || item["Группа"],
                Артикул: item["Артикул"]?.result || item["Артикул"],
                Бренд: item["Бренд"]?.result || item["Бренд"],
                Наименование: item["Наименование"]?.result || item["Наименование"],
                "Цена закупки": item["Цена закупки"]?.result || item["Цена закупки"],
                Bonus: item["Bonus"]?.result || item["Bonus"],
                Вознаграждение: !(item["Вознаграждение"] instanceof Object)
                    ? item["Вознаграждение"]
                    : item["Вознаграждение"]?.result || 0,
                "Разница в оплате": item["Разница в оплате"]?.result || item["Разница в оплате"],
                Логистика: item["Логистика"]?.result || item["Логистика"],
                "Итоговая цена RUB": item["Итоговая цена RUB"]?.result || item["Итоговая цена RUB"],
                "Продажа RUB": item["Продажа RUB"]?.result || item["Продажа RUB"],
                ДатаП: item["ДатаП"]?.result || item["ДатаП"],
                Клиент: item["Клиент"]?.result || item["Клиент"],
                МесяцП: item["МесяцП"]?.result || item["МесяцП"],
                "Чистая прибыль RUB": item["Чистая прибыль RUB"]?.result || item["Чистая прибыль RUB"],
                "% наценки": item["% наценки"]?.result || item["% наценки"],
            }));
    }

    private async getHeadJournal() {
        const hJ = await readExcelRangeToJSon(this.paramsHeadJournal);
        this.headJournal = hJ
            .filter((item) => item["№ заказа"])
            .map((doc) => ({
                "№ заказа": doc["№ заказа"]?.text || doc["№ заказа"].toString(),
                "Дата заказа": doc["Дата заказа"] && !isNaN(Date.parse(doc["Дата заказа"]))
                    ? new Date(doc["Дата заказа"]).toISOString()
                    : "",
                Поставщик: doc["Поставщик"] || "",
                "№ отслеживания": doc["№ отслеживания"]?.text || doc["№ отслеживания"] || "",
                "Статус доставки": doc["Статус доставки"] || "",
                Перевозчик: doc["Перевозчик"] || "",
                "№ отслеживания перевозчика": doc["№ отслеживания перевозчика"]?.text || doc["№ отслеживания перевозчика"] || "",
                Курс: doc["Курс"]?.result || doc["Курс"] || 0,
                "Вознаграждение UAH": doc["Вознаграждение UAH"]?.result || doc["Вознаграждение UAH"] || 0,
                "Сумма оплаты факт USD": doc["Сумма оплаты факт USD"]?.result || doc["Сумма оплаты факт USD"] || 0,
                "Логистика RUB": doc["Логистика RUB"]?.result || doc["Логистика RUB"] || 0,
                "% наценки": doc["% наценки"]?.result || doc["% наценки"] || 0,
                "Итого закупка RUB": doc["Итого закупка RUB"]?.result || doc["Итого закупка RUB"] || 0,
                "Итого продажа RUB": doc["Итого продажа RUB"]?.result || doc["Итого продажа RUB"] || 0,
                "Общий итог iHerb UAH": doc["Общий итог iHerb UAH"]?.result || doc["Общий итог iHerb UAH"] || 0,
                "Чистая прибыль RUB": doc["Чистая прибыль RUB"]?.result || doc["Чистая прибыль RUB"] || 0,
            }));
    }

    private async syncSupplier() {
        console.log("Синхронизация поставщиков из Excel...");
        const suppliers: ISupplier[] = await fetchApi("supplier", "GET", this.token, {});
        const existingNames = new Set(suppliers.map((s) => s.name));

        const uniqueSupplier: ISupplier[] = this.headJournal
            .map((item) => item["Поставщик"])
            .reduce((acc: ISupplier[], name: string) => {
                if (!acc.some((s) => s.name === name)) acc.push({ name });
                return acc;
            }, []);

        const newSuppliers = uniqueSupplier.filter((s) => !existingNames.has(s.name));
        for (const supplier of newSuppliers) {
            await fetchApi("supplier", "POST", this.token, supplier);
            console.log(`✅ Поставщик ${supplier.name} добавлен`);
        }

        const updated: ISupplier[] = await fetchApi("supplier", "GET", this.token, {});
        this.supplierMap = new Map(
            updated.map((item: ISupplier) => {
                if (!item._id || !item.name) throw new Error(`Некорректный поставщик: ${JSON.stringify(item)}`);
                return [item.name, item._id] as const;
            })
        );
        console.log(`✅ Поставщики синхронизированы. Добавлено: ${newSuppliers.length}`);
    }

    private async syncCategory() {
        console.log("Синхронизация категорий из Excel...");
        const existingCategories: ICategory[] = await fetchApi("category", "GET", this.token, {});
        const existingNames = new Set(existingCategories.map((c) => c.name));

        const rootName = "Категории товаров";
        let rootId: string;
        const existingRoot = existingCategories.find((c) => c.name === rootName);
        if (existingRoot?._id) {
            rootId = existingRoot._id;
        } else {
            const root = await fetchApi("category", "POST", this.token, { name: rootName });
            if (!root._id) throw new Error("API не вернул _id для корневой категории");
            rootId = root._id;
            existingNames.add(rootName);
        }

        const brandNames = Array.from(
            new Set(this.journal.map((item) => item["Бренд"]?.toString().trim()))
        ).filter((name) => name && name.length > 0);

        const toCreate = brandNames
            .filter((name) => !existingNames.has(name))
            .map((name) => ({ name, parentCategory: rootId }));

        console.log(`К созданию: ${toCreate.length} из ${brandNames.length} брендов`);

        const errors: string[] = [];
        for (const [i, cat] of toCreate.entries()) {
            try {
                await fetchApi("category", "POST", this.token, cat);
                process.stdout.write(`\r 🔄 Прогресс: ${i + 1}/${toCreate.length}`);
            } catch (error) {
                errors.push(cat.name);
            }
        }
        console.log(`\n✅ Создано: ${toCreate.length - errors.length}`);
        if (errors.length > 0) {
            await writeExcel(errors, `${this.fileName}_ErrorsCategory.xlsx`, performance.now().toString());
            console.log(`❌ Ошибки: ${errors.length}`, errors);
        }
    }

    private async syncProducts() {
        console.log("Синхронизация продуктов из Excel...");
        const [warehouses, categories, suppliers, productsFromDb] = await Promise.all([
            fetchApi("warehouse", "GET", this.token, {}),
            fetchApi("category", "GET", this.token, {}),
            fetchApi("supplier", "GET", this.token, {}),
            fetchApi("product", "GET", this.token, {}),
        ]);

        this.warehouseMap = new Map(warehouses.map((item: IWarehouse) => [item.name, item._id!] as const));
        this.categoryMap = new Map(categories.map((item: ICategory) => [item.name, item._id!] as const));
        this.supplierMap = new Map(suppliers.map((item: ISupplier) => [item.name, item._id!] as const));

        const seen = new Set<string>();
        const uniqueProducts: IProduct[] = [];

        for (const row of this.journal) {
            const { Бренд, Артикул, Наименование, Поставщик, Группа } = row;
            if (!Бренд || !Артикул || !Наименование || !Поставщик || !Группа) continue;

            const key = `${Артикул}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const categoryId = this.categoryMap.get(Бренд);
            const supplierId = this.supplierMap.get(Поставщик);
            const defaultWarehouseId = this.warehouseMap.get(Группа);
            const productConfig = ProductTypeRusMap[Группа as ProductTypeRus];

            if (!categoryId) throw new Error(`Не найдена категория: ${Бренд}`);
            if (!supplierId) throw new Error(`Не найден поставщик: ${Поставщик}`);
            if (!defaultWarehouseId) throw new Error(`Не найден склад: ${Группа}`);
            if (!productConfig) throw new Error(`Не определён тип продукта: ${Группа}`);

            uniqueProducts.push({
                article: Артикул.toString(),
                name: Наименование,
                categoryId,
                supplierId,
                defaultWarehouseId,
                unitOfMeasurement: "шт",
                price: 0,
                createdBy: this.userId,
                lastUpdateBy: this.userId,
                isArchived: false,
                productType: productConfig.name,
            });
        }

        const existingKeys = new Set(productsFromDb.map((p: IProduct) => `${p.article}`));
        const toCreate = uniqueProducts.filter((p) => !existingKeys.has(`${p.article}`));

        console.log(`К созданию: ${toCreate.length} из ${uniqueProducts.length} продуктов`);
        if (toCreate.length === 0) {
            console.log("✅ Нет новых продуктов");
            return;
        }

        const errors: IProduct[] = [];
        for (const [i, product] of toCreate.entries()) {
            try {
                await fetchApi("product", "POST", this.token, product);
                process.stdout.write(`\r 🔄 Прогресс: ${i + 1}/${toCreate.length}`);
            } catch (error) {
                errors.push(product);
            }
        }

        if (errors.length > 0) {
            await writeExcel(errors, `${this.fileName}_errorsProduct.xlsx`, performance.now().toString());
        } else {
            await writeExcel(toCreate, `${this.fileName}_createProduct.xlsx`, performance.now().toString());
        }
        console.log(`\n✅ Создано: ${toCreate.length - errors.length}, ошибок: ${errors.length}`);
    }

    public Main = async () => {
        try {
            await this.init();
            await this.syncSupplier();
            await this.syncCategory();
            await this.syncProducts();
            console.log(this.getDeltaTime());
        } catch (error) {
            console.error("❌ Критическая ошибка в Main:", error);
        }
    };
}

const sinc = new SincExcel();
sinc.Main();
