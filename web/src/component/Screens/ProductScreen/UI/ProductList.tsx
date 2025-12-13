import React, { useState, useMemo, useEffect } from 'react'; // <-- добавили useEffect
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom'; // <-- добавили useSearchParams
import type { ProductDto } from '@warehouse/interfaces/DTO';
import style from './ProductList.module.css';
import { TextField } from '../../../../shared/TextFields';
import { Button } from '../../../../shared/Button';
import { THEME } from '../../../../../../interfaces/Config/Color';

export interface LoaderData {
  products: ProductDto[];
  filters: {
    search: string;
  };
}

export default () => {
  const { products } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Инициализируем из URL
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Синхронизация состояния с URL при изменении searchParams (например, навигация "Назад")
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Обработчик изменения поиска — обновляет и состояние, и URL
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSearchQuery(text);

    // Обновляем URL
    const newParams = new URLSearchParams(searchParams);
    if (text) {
      newParams.set('search', text);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Фильтруем через useMemo — как в CustomerList
const filteredProducts = useMemo(() => {
  if (!searchQuery.trim()) return products;

  // Разбиваем запрос на отдельные слова (игнорируя лишние пробелы)
  const searchWords = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0); // убираем пустые строки

  if (searchWords.length === 0) return products;

  return products.filter((item) => {
    const name = item.name.toLowerCase();
    const article = (item.article || '').toLowerCase(); // защита от null/undefined

    // Проверяем, что КАЖДОЕ слово из запроса есть либо в name, либо в article
    return searchWords.every(word =>
      name.includes(word) || article.includes(word)
    );
  });
}, [products, searchQuery]);

  const handleEdit = (product: ProductDto) => {
    navigate(`/product-form/${product._id}`);
  };

  const handleCreate = () => {
    navigate('/product-form');
  };

  return (
    <div className={style.productListContainer}>
      {/* <Icon
        className={style.backButton}
        name="FaArrowLeft"
        size={32}
        color="black"
        onClick={() => navigate(-1)}
      /> */}

      <TextField
        placeholder="Поиск по названию или артикулу"
        value={searchQuery}
        onChange={handleSearch}
        name="search"
        type="text"
      />
      <Button
        onClick={handleCreate}
        bgColor={THEME.button.apply}
        textColor="#fff"
        icon="FaPlus"
        className={style.addButton}
      />

      <div className={style.productsList}>
        {filteredProducts.length === 0 ? (
          <p>Нет товаров</p>
        ) : (
          filteredProducts.map((item) => (
            <div
              key={item._id}
              className={style.productItem}
              onClick={() => handleEdit(item)}
            >
              <h4>{item.categoryId?.name}, {item.name}</h4>
              <p><strong>Артикул:</strong> {item.article}</p>
              <p><strong>Цена:</strong> {item.price} руб.</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};