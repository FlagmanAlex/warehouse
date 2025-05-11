"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const BD_NAME = process.env.BD_NAME_WAREHOUSE;
const BD_TOKEN = process.env.BD_TOKEN;
const port = process.env.PORT;
if (BD_TOKEN)
    mongoose_1.default.connect(BD_TOKEN, { dbName: BD_NAME })
        .then(() => { console.log('Соединение с базой MongoDB прошло успешно'); })
        .catch(e => console.log(`Ошибка подключения к MongoDB: ${e.message}`));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.listen(port, () => console.log(`Сервер запущен на ${port} порту`));
