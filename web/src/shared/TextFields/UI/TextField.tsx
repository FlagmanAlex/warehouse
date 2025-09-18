import React, { useState } from 'react';
import styles from './TextField.module.css';
import { Icon } from '../../Icon';

interface ITextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const TextField = ({ name, label, value, onChange }: ITextFieldProps) => {
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
    const event = {
      target: { name, value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setFocused(false);
  };

  return (
    <div className={styles.textField}>
      <label className={`${styles.label} ${focused || value ? styles.focusedLabel : ''}`}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          autoComplete="off"
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`${styles.input} ${focused || value ? styles.focused : ''}`}
        />
        {value && (
          <>
            <Icon
              className={styles.clearButton} 
              name="FaXmark" 
              size={16} 
              color="red"
              onClick={handleClear}
              aria-label="Очистить поле"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TextField;