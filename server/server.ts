import dotenv from 'dotenv'
import mongoose from 'mongoose'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { mainRouter } from './src/routes'
import { authMiddleware } from './src/middleware/authMiddleware'

dotenv.config()

const BD_NAME = process.env.BD_NAME_WAREHOUSE
const BD_TOKEN = process.env.BD_TOKEN
const port = process.env.PORT || 3000;

if (!BD_NAME || !BD_TOKEN) {
    console.error('Необходимы переменные окружения BD_NAME_WAREHOUSE и BD_TOKEN');
    process.exit(1);
}

mongoose.connect(BD_TOKEN, { dbName: BD_NAME })
    .then(() => { console.log('Соединение с базой MongoDB прошло успешно') })
    .catch(e => console.log(`Ошибка подключения к MongoDB: ${e.message}`))

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev')); // Логирование HTTP-запросов


//Основные роутеры
app.use('/api', mainRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Что-то пошло не так!');
});


app.listen(port, () => {
    console.log(`Сервер запущен на ${port} порту...`);
});
