import React, { useState } from 'react';
import styles from './TextField.module.css';
import { Icon } from '../../Icon';

// 👇 Добавили 'textarea'
export type InputType = 'text' | 'email' | 'password' | 'date' | 'number' | 'tel' | 'url' | 'button' | 'textarea' | 'time';

export interface TextFieldProps {
  type?: InputType;
  name: string;
  placeholder: string;
  value: any;
  // 👇 Новый пропс для передачи рефа
  inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  // 👇 Один обработчик для обоих типов элементов
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TextField = (({ type, name, placeholder, value, onChange, inputRef }: TextFieldProps) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    if (!value) {
      setFocused(false);
    }
  };

  const handleClear = () => {
    // 👇 Создаём объект события, совместимый с обоими типами
    const event = {
      target: {
        name,
        value: '',
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>; // ✅ Корректная типизация

    onChange(event);
    setFocused(false);
  };

  const renderInput = () => {
    const commonProps = {
      name,
      value: value === undefined || value === null || value === '' ? '' : value,
      onChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      className: `${styles.input} ${focused || value ? styles.focused : ''}`,
      autoComplete: 'off' as const,
    };

    switch (type) {
      case 'textarea':
        return <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} {...commonProps} rows={4} />
      case 'time':
        return <input ref={inputRef as React.Ref<HTMLInputElement>}
          {...commonProps}
          type="time"
        />
      case 'date':
        return <input ref={inputRef as React.Ref<HTMLInputElement>}
          {...commonProps}
          type="date"
          onClick={() => (inputRef as React.RefObject<HTMLInputElement>).current?.showPicker()} />
      default:
        return <input ref={inputRef as React.Ref<HTMLInputElement>} {...commonProps} type={type || 'text'} />
    }
  };

  return (
    <div className={styles.textField}>
      <label className={`${styles.label} ${focused || value ? styles.focusedLabel : ''}`}>
        {placeholder}
      </label>
      <div className={styles.inputWrapper}>
        {renderInput()}
        {value ? (
          <Icon
            className={styles.clearButton}
            name="FaXmark"
            size={16}
            color="red"
            onClick={handleClear}
            aria-label="Очистить поле"
          />
        ) : null}
      </div>
    </div>
  );
});

export default TextField;