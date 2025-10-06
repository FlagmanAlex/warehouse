// src/hooks/useEntitySelectModal.ts

import { useState, useEffect } from 'react';
import type { EntityConstraint } from '../types/EntityConstraint';
import { fetchApi } from '../../../api/fetchApi';
import type { ProductDto } from '@warehouse/interfaces/DTO';

interface UseEntitySelectModalOptions {
  endpoint: string; // ← например: 'category', 'brand', 'user'
  initialSelectedItem?: EntityConstraint | null;
}

export function useEntitySelectModal({
  endpoint,
  initialSelectedItem = null,
}: UseEntitySelectModalOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EntityConstraint | null>(initialSelectedItem);
  const [items, setItems] = useState<EntityConstraint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Загружаем данные при открытии модалки
  useEffect(() => {
    if (!isOpen) return;

    const loadItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (endpoint === 'product') {
          const products: ProductDto[] = await fetchApi('product', 'GET');
          const data: EntityConstraint[] = products.map(product => ({
            _id: product._id!,
            name: `${product.categoryId.name} ${product.name}`,
          }));
          setItems(data);
        } else {
          const data: EntityConstraint[] = await fetchApi(endpoint, 'GET');
          setItems(data);
        }
      } catch (err) {
        console.error(`Ошибка загрузки из ${endpoint}:`, err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [isOpen, endpoint]);

  const openModal = () => setIsOpen(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSelect = (item: EntityConstraint) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  const resetSelection = () => setSelectedItem(null);

  return {
    isOpen,
    selectedItem,
    items,
    isLoading,
    error,
    openModal,
    closeModal,
    handleSelect,
    resetSelection,
  };
}