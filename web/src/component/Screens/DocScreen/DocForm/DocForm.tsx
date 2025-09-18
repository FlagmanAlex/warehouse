import { useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { fetchApi } from '../../../../utils/fetchApi';
import type{ DocDto, DocItemDto } from '@warehouse/interfaces/DTO';
import { EditableItem } from './EditableItem';
import HeaderForm from './HeaderForm';
import styles from './DocForm.module.css';

export type LoaderData = {
    doc: DocDto;
    items: DocItemDto[];
    isNew: boolean;
};


export const DocForm = () => {
  const navigate = useNavigate();

  const revalidator = useRevalidator();

  const { doc: initialDoc, items: initialItems } = useLoaderData() as LoaderData;

  const [doc, setDoc] = useState<DocDto>(initialDoc);
  const [items, setItems] = useState<DocItemDto[]>(initialItems);

  // Режим редактирования
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await fetchApi(`doc/${doc._id}`, 'PUT', { doc, items });
      setIsEditing(false);

      revalidator.revalidate();

      setTimeout(() => {
        navigate(-1);
      }, 100);

    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const handleDelete = () => {
    if (!confirm('Удалить документ? Это действие нельзя отменить.')) return;

    fetchApi(`doc/${doc._id}`, 'DELETE')
      .then(() => {
        navigate(-1);
        alert('Документ удалён');
      })
      .catch((err: any) => {
        alert(`Ошибка: ${err.message}`);
      });
  };

  const renderFooter = () => {
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalSum = items.reduce(
      (sum, i) => sum + i.quantity * (i.unitPrice - (i.bonusStock || 0)),
      0
    );

    return (
      <div className={styles.footer}>
        <p className={styles.total}>
          Всего: {totalQty} шт. Сумма: {totalSum.toFixed(0)} ₽
        </p>
      </div>
    );
  };

  return (
    <div className={styles.content}>
      <HeaderForm
        doc={doc}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleDelete={handleDelete}
        setDoc={setDoc}
        handleSave={handleSave}
      />

      {items.length === 0 ? (
        <p className={styles.empty}>Нет позиций</p>
      ) : (
        <ul className={styles.itemsList}>
          {items.map((item) => (
            <li key={item._id} className={styles.item}>
              {isEditing ? (
                <EditableItem
                  item={item}
                  onUpdate={(updated) =>
                    setItems(items.map((i) => (i._id === item._id ? updated : i)))
                  }
                />
              ) : (
                <div>
                  <h3 className={styles.productName}>{item.productId.name}</h3>
                  <div className={styles.detailsRow}>
                    <span>Кол-во: {item.quantity}</span>
                    <span>Цена: {item.unitPrice.toFixed(0)} ₽</span>
                    <span>Скидка: {item.bonusStock?.toFixed(0)} ₽</span>
                    <span>
                      Сумма:{' '}
                      {(
                        item.quantity *
                        (item.unitPrice - (item.bonusStock || 0))
                      ).toFixed(0)}{' '}
                      ₽
                    </span>
                  </div>
                </div>
              )}
              <hr className={styles.separator} />
            </li>
          ))}
        </ul>
      )}

      {renderFooter()}
    </div>
  );
};