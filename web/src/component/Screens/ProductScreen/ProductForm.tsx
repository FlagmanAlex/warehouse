import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../api/fetchApi';
import type { IProduct } from '@warehouse/interfaces';
import style from './ProductForm.module.css';
import type { ProductDto } from '@warehouse/interfaces/DTO';
// import { CategorySelectModal, SupplierSelectModal } from '../../SelectModals/index';
import { Button } from '../../../shared/Button';
import { THEME } from '@warehouse/interfaces/config';
import { TextField, type TextFieldProps } from '../../../shared/TextFields/UI/TextField';
import { EntitySelectModal } from '../../SelectModals/EntitySelectModal';

interface FieldProps {
    label: string;
    name: keyof IProduct;
    type: TextFieldProps['type'];
}

/*
    +article: string
    +name: string                //Наименование
    +description?: string        //Описание продукции
    +categoryId: string          //Id категории
    +unitOfMeasurement?: ProductUnit;    //Единицы измерения
    +price: number               //Цена
    +minStock?: number            //Минимальный запас
    isArchived: boolean         //Архивация позиции в справочнике (вместо удаления)
    createdBy: string           //Создатель
    lastUpdateBy: string        //Обновил
    +supplierId?: string          //Поставщик
    createdAt?: Date             //Дата создания
    updatedAt?: Date             //Дата последнего обновления
    +defaultWarehouseId: string  //Id склада по умолчанию
    image?: string[]             //Изображения
    +packagingId?: string           //Упаковка


*/

const fields: FieldProps[] = [
    { label: 'Артикул', name: 'article', type: 'text' },
    { label: 'Наименование продукта', name: 'name', type: 'textarea' },
    { label: 'Цена по умолчанию', name: 'price', type: 'number' },
    { label: 'Единицы измерения', name: 'unitOfMeasurement', type: 'text' },
    { label: 'Минимальный запас', name: 'minStock', type: 'number' },
    // { label: 'Поставщик', name: 'supplierId', type: 'text' },
    // { label: 'Склад по умолчанию', name: 'defaultWarehouseId', type: 'text' },
    // { label: 'Упаковка', name: 'packagingId', type: 'text' },
    { label: 'Описание продукта', name: 'description', type: 'textarea' },
];

interface LoaderData {
    product: ProductDto;
}
const localStorageKey = 'productForm';

const ProductForm = () => {
    const { product: initialProduct } = useLoaderData<LoaderData>()
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductDto>(() => {
        // Если это новый продукт (нет _id) — можно брать из localStorage
        if (!initialProduct._id) {
            const savedProduct = localStorage.getItem(localStorageKey);
            return savedProduct ? JSON.parse(savedProduct) : initialProduct;
        }

        // Если это редактирование — всегда используем данные из loader'а
        return initialProduct;
    });

    useEffect(() => {
        if (initialProduct._id) {
            // Это редактирование — удаляем старый кэш
            localStorage.removeItem(localStorageKey);
        }
    }, [initialProduct._id]);

    useEffect(() => {
        // Сохраняем в localStorage только если это новый продукт
        if (!product._id) {
            localStorage.setItem(localStorageKey, JSON.stringify(product));
        }
    }, [product]);


    const handleSubmit = async () => {
        if (!product.name || !product.article || product.price == null || product.price < 0) {
            alert('Заполните все обязательные поля');
            return;
        }

        try {
            const createProduct = {
                name: product.name,
                article: product.article,
                categoryId: product.categoryId,
                unitOfMeasurement: 'шт',
                price: product.price,
                isArchived: false,
            };
            await fetchApi('product', 'POST', createProduct);
            localStorage.removeItem(localStorageKey);
            navigate(-1);
        } catch (error) {
            alert('Не удалось создать товар');
        }
    };

    const handleUpdate = async () => {
        if (!product._id || !product.name || !product.article) {
            alert('Заполните все обязательные поля');
            return;
        }

        try {
            await fetchApi(`product/${product._id}`, 'PATCH', product);
            localStorage.removeItem(localStorageKey);
            navigate(-1);
        } catch (error) {
            alert('Не удалось обновить товар');
        }
    };

    const handleDelete = async () => {
        if (!product) return;

        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await fetchApi(`product/${product._id}`, 'DELETE');
                navigate(-1);
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Не удалось удалить товар');
            }
        }
    };

    return (
        <div className={style.productFormContainer}>
            <h2>{product._id ? 'Редактировать товар' : 'Создать товар'}</h2>

            {/* Категория */}
            <EntitySelectModal
                endpoint='category'
                selectedItem={product.categoryId?._id ? product.categoryId : null} // Используем _id для сравнения, если необходимо
                onSelect={category => setProduct({ ...product, categoryId: { _id: category._id, name: category.name } })}
                modalTitle='Выберите категорию'
                buttonText={product.categoryId?.name || 'Категория'}
            />
            <EntitySelectModal
                endpoint='supplier'
                selectedItem={product.supplierId?._id ? product.supplierId : null} // Используем _id для сравнения, если необходимо
                onSelect={supplier => setProduct({ ...product, supplierId: { _id: supplier._id, name: supplier.name } })}
                modalTitle='Выберите поставщика'
                buttonText={product.supplierId?.name || 'Поставщик'}
            />
            {/* Поля формы */}
            {fields.map((field) => (
                <TextField
                    name={field.name}
                    key={field.name}
                    placeholder={field.label}
                    type={field.type}
                    value={product[field.name as keyof IProduct] === 0 ? undefined : product[field.name as keyof IProduct]}
                    onChange={(e) => setProduct({ ...product, [field.name]: e.target.value })}
                />
            ))}

            {/* Кнопки */}
            <div className={style.formButtons}>
                {product._id ? (
                    <>
                        <Button text="Обновить" textColor='#fff' bgColor={THEME.button.apply} onClick={handleUpdate} />
                        <Button text="Удалить" textColor='#fff' bgColor={THEME.button.delete} onClick={handleDelete} />
                    </>
                ) : (
                    <>
                        <Button text="Создать" textColor='#fff' bgColor={THEME.button.apply} onClick={handleSubmit} />
                        <Button text="Очистить" textColor='#fff' bgColor={THEME.button.statusDisabled} onClick={() => {
                            setProduct(initialProduct);
                            localStorage.removeItem(localStorageKey);
                        }} />
                    </>
                )}
                <Button text="Назад" textColor='#fff' bgColor={THEME.button.cancel} onClick={() => {
                    navigate(-1);
                }} />
            </div>

        </div>
    );
};

export default ProductForm;