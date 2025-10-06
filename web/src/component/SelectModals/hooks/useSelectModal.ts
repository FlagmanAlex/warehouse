// src/hooks/useSelectModal.ts

import { useState } from 'react';
import type { SelectableItem } from '../types/SelectableItem';


export function useSelectModal<T extends SelectableItem>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openModal = () => setIsOpen(true);

  const closeModal = () => {
    setIsOpen(false);
    // Опционально: очищать поиск или выбранный элемент при закрытии
  };

  const handleSelect = (item: T) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  return {
    isOpen,
    selectedItem,
    openModal,
    closeModal,
    handleSelect,
    // Удобно: можно сбросить выбор отдельно
    resetSelection: () => setSelectedItem(null),
  };
}