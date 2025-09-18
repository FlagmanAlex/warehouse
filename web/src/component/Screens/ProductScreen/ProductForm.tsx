import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from '../../../utils/fetchApi';
import type { IProduct, ICategory } from '@warehouse/interfaces';
import style from './ProductForm.module.css';
import type { ProductDto } from '@warehouse/interfaces/DTO';


export const ProductForm = () => {
    const { productId } = useParams();
    
    const navigate = useNavigate();

    const [product, setProduct] = useState<Partial<IProduct>>({
        name: '',
        article: '',
        categoryId: '',
        unitOfMeasurement: 'шт',
        price: 0,
        isArchived: false,
    });

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchApi('category', 'GET');
                setCategories(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                alert('Не удалось загрузить категории');
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();

        if (productId) {
            fetchProduct(productId);
        } else {
            setProduct({
                name: '',
                article: '',
                categoryId: '',
                unitOfMeasurement: 'шт',
                price: 0,
                isArchived: false,
            });
        }
    }, [productId]);

    const fetchProduct = async (id: string) => {
        try {
            const response: ProductDto = await fetchApi(`product/${id}`, 'GET');
            setProduct({
                ...response,
                categoryId: response.categoryId._id,
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Не удалось загрузить товар');
            navigate(-1);
        }
    };

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
            await fetchApi(`product/${product._id}`, 'PUT', product as Omit<IProduct, '_id'>);
            navigate(-1);
        } catch (error) {
            alert('Не удалось обновить товар');
        }
    };

    const handleDelete = async () => {
        if (!productId) return;

        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await fetchApi(`product/${productId}`, 'DELETE');
                navigate(-1);
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Не удалось удалить товар');
            }
        }
    };

    return (
        <div className={style.productFormContainer}>
            <h2>{productId ? 'Редактировать товар' : 'Создать товар'}</h2>

            {/* Категория */}
            <label className={style.formLabel}>Категория</label>
            {loadingCategories ? (
                <p>Загрузка категорий...</p>
            ) : (
                <select
                    className={style.formSelect}
                    value={product.categoryId || ''}
                    onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            )}

            {/* Название */}
            <label className={style.formLabel}>Название</label>
            <textarea
                className={style.formInput}
                placeholder="Введите название товара"
                value={product.name || ''}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                rows={3}
            />

            {/* Артикул */}
            <label className={style.formLabel}>Артикул</label>
            <input
                type="text"
                className={style.formInput}
                placeholder="Введите артикул"
                value={product.article || ''}
                onChange={(e) => setProduct({ ...product, article: e.target.value })}
            />

            {/* Цена */}
            <label className={style.formLabel}>Цена</label>
            <input
                type="number"
                className={style.formInput}
                placeholder="Введите цену"
                value={product.price || ''}
                onChange={(e) =>
                    setProduct({
                        ...product,
                        price: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value),
                    })
                }
                min="0"
                step="0.01"
            />

            {/* Кнопки */}
            <div className={style.formButtons}>
                {productId ? (
                    <>
                        <button className={`${style.btn} ${style.btnPrimary}`} onClick={handleUpdate}>
                            Обновить товар
                        </button>
                        <button className={`${style.btn} ${style.btnDanger}`} onClick={handleDelete}>
                            Удалить товар
                        </button>
                    </>
                ) : (
                    <button className={`${style.btn} ${style.btnSuccess}`} onClick={handleSubmit}>
                        Создать товар
                    </button>
                )}
                <button className={`${style.btn} ${style.btnSecondary}`} onClick={() => navigate(-1)}>
                    Назад
                </button>
            </div>

        </div>
    );
};
