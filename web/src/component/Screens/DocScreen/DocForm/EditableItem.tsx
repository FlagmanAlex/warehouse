import type { DocItemDto } from "@warehouse/interfaces/DTO";
import { useState, useEffect } from "react";
import styles from './EditableItem.module.css';
import { EntitySelectModal } from "../../../SelectModals";
import { Icon } from "../../../../shared/Icon";

interface EditableItemProps {
  docItem: DocItemDto;
  onUpdate: (item: DocItemDto) => void;
  onDelete: (item: DocItemDto) => void;
}

const EditableItem = ({ docItem, onUpdate, onDelete }: EditableItemProps) => {
  const [quantity, setQuantity] = useState(docItem.quantity.toString());
  const [price, setPrice] = useState<string>(docItem.unitPrice.toString());
  const [bonusStock, setBonusStock] = useState<string>(
    docItem.bonusStock?.toString() || ''
  );

  useEffect(() => {
    const updatedItem: DocItemDto = {
      ...docItem,
      quantity: parseFloat(quantity) || 0,
      unitPrice: price ? parseFloat(price) : 0,
      bonusStock: bonusStock ? parseFloat(bonusStock) : 0,
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
      <div className={styles.nameRow}>
        <EntitySelectModal
          endpoint="product"
          onSelect={(item) => onUpdate({ ...docItem, productId: { ...docItem.productId, _id: item._id, name: item.name } })}
          selectedItem={{ _id: docItem.productId._id!, name: `${docItem.productId.categoryId.name} ${docItem.productId.name}` }}
          modalTitle="Выберите продукт"
          buttonText={docItem.productId.name ? `${docItem.productId.categoryId.name} ${docItem.productId.name}` : 'Выберите продукт'}
        />
        {/* удалить */}
        <Icon name="FaXmark" size={20} color="red" onClick={() => onDelete(docItem)} className={styles.deleteIcon} />
      </div>
      {/* <h3 className={styles.productName}>{item.productId.name}</h3> */}
      <div className={styles.editRow}>
        <input
          type="text"
          inputMode="decimal"
          className={styles.editInput}
          value={quantity === '0' ? '' : quantity}
          onChange={(e) => handleNumberChange(e.target.value, setQuantity)}
          placeholder="Кол-во"
        />
        <input
          type="text"
          inputMode="decimal"
          className={styles.editInput}
          value={price === '0' ? '' : price}
          onChange={(e) => handleNumberChange(e.target.value, setPrice)}
          placeholder="Цена"
        />
        <input
          type="text"
          inputMode="decimal"
          className={styles.editInput}
          value={bonusStock === '0' ? '' : bonusStock || ''}
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

export default EditableItem;