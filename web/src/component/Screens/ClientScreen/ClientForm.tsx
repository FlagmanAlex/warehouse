import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import style from './ClientForm.module.css';
import { fetchApi } from '../../../utils/fetchApi';
import type { ICustomer } from '@warehouse/interfaces';

interface FormData {
    name: string;
    phone: string;
    address: string;
    percent: string;
    accountManager: string;
}

export const ClientForm = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        address: '',
        percent: '',
        accountManager: '',
    });
    const isEditing = !!id && id !== 'new';

    useEffect(() => {
        if (isEditing) {
            fetchClient(id!);
        }
    }, [id]);

    const fetchClient = async (id: string) => {
        try {
            const client: ICustomer = await fetchApi(`customer/${id}`, 'GET', {});
            setFormData({
                name: client.name || '',
                phone: client.phone || '',
                address: client.address || '',
                percent: client.percent ? client.percent.toString() : '',
                accountManager: client.accountManager || '',
            });
        } catch (error) {
            console.error('Ошибка получения клиента:', error);
            alert('Не удалось получить данные клиента');
        }
    };

    const handleSubmit = async () => {
        const data = {
            ...formData,
            percent: parseInt(formData.percent) || 0,
        };

        try {
            if (isEditing) {
                await fetchApi(`customer/${id}`, 'PUT', data);
            } else {
                await fetchApi('customer', 'POST', data);
            }
            navigate('/clients', { state: { refresh: true } });
        } catch (error) {
            console.error('Ошибка отправки данных:', error);
            alert('Не удалось сохранить клиента');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
            try {
                await fetchApi(`customer/${id}`, 'DELETE');
                navigate('/clients', { state: { refresh: true } });
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Не удалось удалить клиента');
            }
        }
    };

    return (
        <div className={style.clientFormContainer}>
            <h2>{isEditing ? 'Редактировать клиента' : 'Создать клиента'}</h2>

            <input
                type="text"
                placeholder="Имя"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={style.formInput}
            />
            <input
                type="text"
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={style.formInput}
            />
            <input
                type="text"
                placeholder="Адрес"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={style.formInput}
            />
            <input
                type="number"
                placeholder="Процент"
                value={formData.percent}
                onChange={(e) => setFormData({ ...formData, percent: e.target.value })}
                className={style.formInput}
            />
            <input
                type="text"
                placeholder="ID менеджера"
                value={formData.accountManager}
                onChange={(e) => setFormData({ ...formData, accountManager: e.target.value })}
                className={style.formInput}
            />

            <button onClick={handleSubmit} className={style.submitButton}>
                {isEditing ? 'Сохранить' : 'Создать'}
            </button>

            {isEditing && (
                <button onClick={handleDelete} className={style.deleteButton}>
                    Удалить
                </button>
            )}

            <button onClick={() => navigate('/clients')} className={style.cancelButton}>
                Назад
            </button>
        </div>
    );
};
