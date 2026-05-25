import dotenv from "dotenv";
dotenv.config();

const server: string = `${process.env.HOST}:${process.env.PORT}`;
console.log(server);

export const fetchApi = async (
        url: string,
        method: "POST" | "PATCH" | "GET" | "DELETE",
        token: string,
        body: Object
    ) => {
        try {
            const requestOptions: RequestInit = {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            };

            // Добавляем body только если он есть и метод != 'GET'
            if (body && method !== "GET") {
                requestOptions.body = JSON.stringify(body);
            }
            const response = await fetch(
                `${server}/api/${url}`,
                requestOptions
            );

            if (!response.ok) {
                throw Error("❌ Ошибка выполнения запроса fetchApi");
            }
            const data = await response.json();

            return data;
        } catch (error) {
            console.log(`❌ Ошибка выполнения запроса ${url}`);
            console.log("Тело запроса:", body);
        }
    }
