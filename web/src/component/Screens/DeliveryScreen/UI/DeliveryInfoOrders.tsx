import { useEffect, useState } from "react";
import { fetchApi } from "../../../../api/fetchApi";
import { type IDoc } from "@warehouse/interfaces";

// Интерфейс для пропсов компонента
interface DeliveryInfoOrdersProps {
    docIds: string[];
}

interface ApiDoc {
    doc: IDoc
}

export const DeliveryInfoOrders = ({ docIds }: DeliveryInfoOrdersProps) => {
    const [orders, setOrders] = useState<IDoc[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

useEffect(() => {
    // Если массив пуст — сбрасываем состояние и выходим
    if (!docIds || docIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
    }

    
    let isMounted = true; // Защита от обновления состояния после размонтирования

    const loadOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            // Создаем массив промисов для каждого ID
            const requests = docIds.map(async (id) => {
                try {
                    const response = await fetchApi<ApiDoc>(`doc/${id}`, 'GET', {});
                    
                    return { success: true, data: response, id };
                } catch (err) {
                    // Ловим ошибку конкретного запроса, чтобы не ронять Promise.all
                    console.warn(`❌ Не удалось загрузить заказ ${id}:`, err);
                    return { success: false, error: err, id };
                }
            });

            // Ждем выполнения всех запросов параллельно
            const results = await Promise.all(requests);

            console.log(results);
            

            if (!isMounted) return;

            // Парсим успешные ответы
            const fetchedOrders: IDoc[] = [];

            for (const result of results) {
                if (!result.success) continue;

                const response = result.data?.doc
                if (!response) continue;                
                

                // 🔄 Унифицированная обработка ответа (массив / объект / обертка)
                if (response) {
                    fetchedOrders.push({...response});
                } else if (response && typeof response === 'object' && '_id' in response) {
                    fetchedOrders.push(response as IDoc);
                }
            }

            // 🔄 Опционально: удаляем дубликаты по _id
            const uniqueOrders = fetchedOrders.filter((order, index, self) =>
                index === self.findIndex(o => o._id === order._id)
            );

            setOrders(uniqueOrders);

            // Лог для отладки
            console.log(`✅ Загружено ${uniqueOrders.length} заказов из ${docIds.length} запросов`);

        } catch (err) {
            // Критическая ошибка (например, сеть упала полностью)
            console.error("💥 Критическая ошибка при загрузке:", err);
            if (isMounted) {
                setError(err instanceof Error ? err.message : "Неизвестная ошибка");
                setOrders([]);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    loadOrders();

    // Cleanup-функция
    return () => {
        isMounted = false;
    };
}, [docIds]);
    // Рендеринг состояния загрузки
    if (loading) {
        return <div>Загрузка заказов...</div>;
    }

    // Рендеринг состояния ошибки
    if (error) {
        return <div style={{ color: 'red' }}>Ошибка: {error}</div>;
    }

    return (
        <div>
            <h2>Заказы</h2>
            {orders.length === 0 ? (
                <p>Заказы не найдены.</p>
            ) : (
                <ul>
                    {orders.map((order) => (
                        <li key={order._id}>
                            {/* Вывод номера заказа */}
                            <strong>№ {order.docNum}</strong>
                            
                            {/* Вывод суммы. Проверяем наличие поля sum/total в интерфейсе. 
                                Замените order.sum на правильное поле из вашего интерфейса IDocOrderOut, 
                                например order.totalAmount или order.price */}
                            {order.summ !== undefined ? (
                                <span> — Сумма: { order.summ } ₽</span>
                            ) : (
                                <span> — Сумма: не указана</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};