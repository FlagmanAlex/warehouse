import dotenv from 'dotenv'
import mongoose from 'mongoose'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { categoryRouter } from './src/routes/categoryRouter';
import { productRouter } from './src/routes/productRouter';

dotenv.config()

const BD_NAME = process.env.BD_NAME_WAREHOUSE
const BD_TOKEN = process.env.BD_TOKEN
const port = process.env.PORT || 3000;

if (BD_TOKEN) mongoose.connect(BD_TOKEN, { dbName: BD_NAME })
    .then(() => { console.log('Соединение с базой MongoDB прошло успешно') })
    .catch(e => console.log(`Ошибка подключения к MongoDB: ${e.message}`))

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
