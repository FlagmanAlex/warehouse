import { useState, useMemo, useEffect } from 'react'; // <-- добавили useEffect
import { useNavigate, useLoaderData, useSearchParams } from 'react-router-dom';
import style from './CustomerList.module.css';
import type { ICustomer } from '@warehouse/interfaces';
import { TextField } from '../../../shared/TextFields';
import { Button } from '../../../shared/Button';
import { THEME } from '../../../../../interfaces/Config/Color';

export interface LoaderData {
    customers: ICustomer[];
    filters: {
        search: string;
    };
}

export default () => {
    const { customers } = useLoaderData<LoaderData>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Инициализируем searchQuery из URL-параметра, fallback к filters.search
    const initialSearch = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

    // Синхронизируем searchQuery с URL при монтировании и при изменении searchParams
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        if (urlSearch !== searchQuery) {
            setSearchQuery(urlSearch);
        }
    }, [searchParams]); // <-- зависимость от searchParams

    // Обновляем URL при изменении searchQuery
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setSearchQuery(value); // обновляем состояние

        // Обновляем URL
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        setSearchParams(newParams, { replace: true });
    };

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers;

        const searchWords = searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 0);

        if (searchWords.length === 0) return customers;

        return customers.filter((customer) => {
            const name = customer.name.toLowerCase();
            const phone = (customer.phone || '').toLowerCase();
            const address = (customer.address || '').toLowerCase();

            // Проверяем, что КАЖДОЕ слово из запроса есть хотя бы в одном поле
            return searchWords.every(word =>
                name.includes(word) ||
                phone.includes(word) ||
                address.includes(word)
            );
        });
    }, [customers, searchQuery]);


    const customerCards = filteredCustomers.map((item) => (
        <div
            key={item._id}
            className={style.customerCard}
            onClick={() => navigate(`/customer/${item._id}`)}
        >
            <h3>{item.name}</h3>
            <p>
                <strong>Телефон:</strong>
                {item.phone ? (
                    <a
                        href={`tel:${item.phone}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {item.phone}
                    </a>
                ) : (
                    <span>Не указан</span>
                )}
            </p>
            <p>
                <strong>Адрес:</strong>
                {item.gps ?
                    <a
                        href={`geo:${item.gps}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {item.address}
                    </a> : item.address}</p>
        </div>
    ));

    return (
        <>
            <div className={style.customerListContainer}>
                <TextField
                    name="search"
                    type="text"
                    placeholder="Поиск по имени"
                    value={searchQuery}
                    onChange={handleSearchChange} // <-- используем обработчик
                />
                <Button
                    onClick={() => navigate('/customer')}
                    bgColor={THEME.button.apply}
                    textColor='#fff'
                    icon={'FaPlus'}
                    className={style.floatingButton}
                />
                <div className={style.customerList}>
                    {filteredCustomers.length > 0 ? (
                        customerCards
                    ) : (
                        <p>Клиенты не найдены</p>
                    )}
                </div>
            </div>
        </>
    );
};