import type { DocItemDto } from "@warehouse/interfaces/DTO";
import { useState, useEffect } from "react";
import styles from './EditableItem.module.css';

interface EditableItemProps {
  item: DocItemDto;
  onUpdate: (item: DocItemDto) => void;
}

export const EditableItem = ({ item, onUpdate }: EditableItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [price, setPrice] = useState(item.unitPrice.toString());
  const [bonusStock, setBonusStock] = useState<string>(
    item.bonusStock?.toString() || ''
  );

  useEffect(() => {
    const updatedItem: DocItemDto = {
      ...item,
      quantity: parseFloat(quantity) || 0,
      unitPrice: parseFloat(price) || 0,
      bonusStock: bonusStock ? parseFloat(bonusStock) : undefined,
    };
    onUpdate(updatedItem);
  }, [quantity, price, bonusStock]);

  const handleNumberChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    // Разрешаем только цифры, точку и минус (для отрицательных)
    if (/^-?\d*\.?\d*$/.test(value) || value === '') {
      setter(value);
    }
  };

  const total = (parseFloat(quantity) || 0) * (
    (parseFloat(price) || 0) - (parseFloat(bonusStock) || 0)
  );

  return (
    <div className={styles.itemRow}>
      <h3 className={styles.productName}>{item.productId.name}</h3>
      <div className={styles.editRow}>
        <input
          type="text"
          inputMode="decimal"
          className={styles.editInput}
          value={quantity}
          onChange={(e) => handleNumberChange(e.target.value, setQuantity)}
          placeholder="Кол-во"
        />
        <input
          type="text"
          inputMode="decimal"
          className={styles.editInput}
          value={price}
          onChange={(e) => handleNumberChange(e.target.value, setPrice)}
          placeholder="Цена"
        />
        <input
          type="text"
          inputMode="decimal"
          className={styles.editInput}
          value={bonusStock}
          onChange={(e) => handleNumberChange(e.target.value, setBonusStock)}
          placeholder="Скидка"
        />
        <div className={styles.totalCell}>
          {isNaN(total) ? '—' : total.toLocaleString()} ₽
        </div>
      </div>
    </div>
  );
};