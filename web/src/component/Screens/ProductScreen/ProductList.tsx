import React, { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import type { ProductDto } from '@warehouse/interfaces/DTO';
import style from './ProductList.module.css'; // Подключим CSS отдельно
import { TextField } from '../../../shared/TextFields';
import { Icon } from '../../../shared/Icon';

export interface LoaderData {
  docs: ProductDto[];
  filters: {
    search: string;
  };
}


export const ProductList = () => {

  const { docs: products, filters } = useLoaderData<LoaderData>();
  const [filteredProducts, setFilteredProducts] = useState<ProductDto[]>(products);
  const [searchQuery, setSearchQuery] = useState<string>(filters.search);
  const navigate = useNavigate();


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchQuery(text);
    if (!text) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase()) ||
      item.article.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleEdit = (productId: string) => {
    navigate(`/product-form/${productId}`);
  };

  const handleCreate = () => {
    navigate('/product-form');
  };

  return (
    <div className={style.productListContainer}>
      <Icon className={style.backButton} name="FaArrowLeft" size={32} color="black" onClick={() => navigate(-1)} />
      <Icon className={style.addButton} name="FaPlus" size={10} color="white" onClick={handleCreate} />

      <TextField
        label="Поиск по названию или артикулу"
        value={searchQuery}
        onChange={handleSearch}
        name='search'
      />

      <div className={style.productsList}>
        {filteredProducts.length === 0 ? (
          <p>Нет товаров</p>
        ) : (
          filteredProducts.map((item) => (
            <div key={item._id} className={style.productItem} onClick={() => handleEdit(item._id!)}>
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
