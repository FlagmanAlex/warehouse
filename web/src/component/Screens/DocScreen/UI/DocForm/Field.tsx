import { useState, useEffect } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label: string;
  value: string | number | Date | null | undefined;
  editable: boolean;
  onChange?: (val: string) => void;
  options?: { label: string; value: string }[];
  type?: 'text' | 'date' | 'select' | 'readonly';
}

export const Field = ({ label, value, editable, onChange, options, type = 'text' }: FieldProps) => {
  const [text, setText] = useState<string>(
    value instanceof Date ? value.toISOString().split('T')[0] : value?.toString() || ''
  );

  useEffect(() => {
    const displayValue =
      value instanceof Date ? value.toISOString().split('T')[0] : value?.toString() || '';
    setText(displayValue);
  }, [value]);

  const handleChange = (newValue: string) => {
    setText(newValue);
    onChange?.(newValue);
  };

  // Поле даты
  if (type === 'date') {
    return (
      <div className={styles.fieldRow}>
        <label className={styles.label}>{label}:</label>
        {editable ? (
          <input
            type="date"
            className={styles.dateInput}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
          />
        ) : (
          <span className={styles.value}>
            {value instanceof Date ? new Date(value).toLocaleDateString() : '—'}
          </span>
        )}
      </div>
    );
  }

  // Только для чтения
  if (!editable) {
    return (
      <div className={styles.fieldRow}>
        <label className={styles.label}>{label}:</label>
        <span className={styles.value}>{value?.toString() || '—'}</span>
      </div>
    );
  }

  // Выпадающий список
  if (options) {
    return (
      <div className={styles.fieldRow}>
        <label className={styles.label}>{label}:</label>
        <select
          className={styles.select}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Выберите...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Обычный текстовый ввод
  return (
    <div className={styles.fieldRow}>
      <label className={styles.label}>{label}:</label>
      <input
        type="text"
        className={styles.input}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Введите ${label.toLowerCase()}`}
        disabled={!editable}
      />
    </div>
  );
};