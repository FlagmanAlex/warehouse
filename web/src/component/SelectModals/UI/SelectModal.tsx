// src/components/SelectModal/SelectModal.tsx

import { useState, useEffect, useRef } from 'react';
import styles from './SelectModal.module.css';
import type { EntityConstraint } from '../types/EntityConstraint'; // ← изменил импорт
import { TextField } from '../../../shared/TextFields';

interface SelectModalProps<T extends EntityConstraint> {
  items: T[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  title?: string;
  loading?: boolean;  // ← новое: состояние загрузки
  error?: string;     // ← новое: ошибка
  selectedItem?: T | null;
}

export function SelectModal<T extends EntityConstraint>({
  items,
  isOpen,
  onClose,
  onSelect,
  title = "Выберите элемент",
  loading = false,
  error = undefined,
  selectedItem = null,
}: SelectModalProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Внутри SelectModal, после объявления modalRef
  const listRef = useRef<HTMLUListElement>(null);

  function matchesFuzzyWords(query: string, text: string): boolean {
    if (!query.trim()) return true;

    // Очистка: оставляем только буквы и цифры, приводим к нижнему регистру
    const clean = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');

    const queryParts = query
      .split(/\s+/)
      .map(part => clean(part))
      .filter(part => part.length > 0);

    if (queryParts.length === 0) return true;

    const words = text.split(/\s+/).map(word => clean(word));

    // Каждая часть запроса должна быть найдена хотя бы в одном слове
    return queryParts.every(queryPart =>
      words.some(word => word.includes(queryPart))
    );
  }


  // В компоненте:
  const filteredItems = items.filter((item) => matchesFuzzyWords(searchTerm, item.name));

  // //Старая фильтрация
  // const filteredItems = items.filter((item) =>
  //   item.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );



  //Установка фокуса на TextField
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && selectedItem && !loading && listRef.current) {
      // Проверяем, есть ли selectedItem в отфильтрованном списке
      const isItemSelectedInList = filteredItems.some(item => item._id === selectedItem._id);
      if (!isItemSelectedInList) return;

      const timer = setTimeout(() => {
        const selectedItemEl = listRef.current?.querySelector(
          `[data-id="${selectedItem._id}"]`
        ) as HTMLElement | null;
        if (selectedItemEl) {
          selectedItemEl.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // лучше 'center' для модалки
          });
        }
      }, 50); // даже 50 мс достаточно

      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedItem, loading, filteredItems]); // ← добавь filteredItems и loading

  // Сбрасываем поиск при открытии/закрытии
  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  // Фокус на TextField при открытии модалки
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Закрытие по клику вне модалки
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.searchBox}>
          <TextField
            inputRef={inputRef}
            name="search"
            placeholder="Поиск"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          // disabled={loading} // ← блокируем поиск во время загрузки
          />
        </div>

        {/* Индикатор загрузки */}
        {loading && (
          <div className={styles.loading}>
            Загрузка...
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Список только если не грузится и нет ошибки */}
        {!loading && !error && (
          <ul className={styles.list} ref={listRef}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <li
                  key={item._id}
                  data-id={item._id} // ← добавлено для поиска
                  className={`${styles.listItem} ${selectedItem?._id === item._id ? styles.selectedItem : ''
                    }`}
                  onClick={() => onSelect(item)}
                >
                  <span className={styles.itemName}>{item.name}</span>
                </li>
              ))
            ) : (
              <li className={styles.empty}>Ничего не найдено</li>
            )}
          </ul>
        )}

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}