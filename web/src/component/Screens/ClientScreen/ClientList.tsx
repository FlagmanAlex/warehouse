import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './ClientList.module.css'; // Подключаем CSS файл
import { fetchApi } from '../../../utils/fetchApi';
import type { ICustomer } from '@warehouse/interfaces'

export const ClientList = () => {
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const location = useLocation();

    const filteredCustomers = useMemo(() => {
        if (customers.length === 0) return [];
        return customers.filter((customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customers, searchQuery]);

    const fetchClients = async () => {
        try {
            const customers: ICustomer[] = await fetchApi('customer', 'GET', {});
            setCustomers(customers);
        } catch (error) {
            console.error('Ошибка загрузки клиентов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Если нужно реагировать на обновление — можно использовать location.state или query-параметры
    useEffect(() => {
        if (location.state?.refresh) {
            fetchClients();
        }
    }, [location.state?.refresh]);

    if (isLoading) {
        return (
            <div className={style.centered}>
                <div className={style.spinner}>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={style.clientListContainer}>
            {/* Поиск */}
            <input
                type="text"
                placeholder="Поиск по имени"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={style.searchInput}
            />

            {/* Кнопка обновления */}
            <button onClick={fetchClients} className={style.refreshButton}>
                Обновить
            </button>

            {/* Список клиентов */}
            <div className={style.clientsList}>
                {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((item) => (
                        <div
                            key={item._id}
                            className={style.clientCard}
                            onClick={() => navigate(`/client-form/${item._id}`)}
                        >
                            <h3>{item.name}</h3>
                            <p><strong>Телефон:</strong> {item.phone}</p>
                            <p><strong>Адрес:</strong> {item.address}</p>
                        </div>
                    ))
                ) : (
                    <p>Клиенты не найдены</p>
                )}
            </div>

            {/* Кнопка создания нового клиента */}
            <button
                className={style.floatingButton}
                onClick={() => navigate('/client-form/new')}
            >
                +
            </button>
        </div>
    );
};
