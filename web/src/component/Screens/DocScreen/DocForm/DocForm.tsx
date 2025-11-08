// DocForm.tsx
import { useEffect, useState } from 'react';
import { Form, useLoaderData, useNavigate, useActionData, useLocation } from 'react-router-dom';
import type { DocAndItemsDto, DocDto, DocItemDto } from '@warehouse/interfaces/DTO';
import EditableItem from './EditableItem';
import HeaderForm from './HeaderForm';
import styles from './DocForm.module.css';
import { Button } from '../../../../shared/Button';

export type LoaderData = {
  doc: DocDto;
  items: DocItemDto[];
};

const DocForm = () => {
  const location = useLocation();
  const search = location.search;
  console.log(search);
  
  const navigate = useNavigate();
  const actionData = useActionData();
  const { doc: initialDoc, items: initialItems } = useLoaderData() as LoaderData;

  const [totalSum, setTotalSum] = useState(0);

  const [formData, setFormData] = useState<DocAndItemsDto>({
    doc: initialDoc,
    items: initialItems,
  });


  // ✅ Установить isEditing в true по умолчанию
  const [isEditing, setIsEditing] = useState(true);

  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const newDocItem: DocItemDto = {
    _id: generateTempId(), // ✅ Обязательно!
    docId: formData.doc._id || '',
    productId: {
      article: '',
      price: 0,
      isArchived: false,
      name: '',
      categoryId: { _id: '', name: '' },
      unitOfMeasurement: 'шт',

    },
    quantity: 0,
    unitPrice: 0,
    bonusStock: 0,
    description: '',
  }

  const renderFooter = () => {
    const totalSKU = formData.items.length;
    console.log(formData);

    return (
      <div className={styles.footer}>
        <p className={styles.total}>
          Всего: {totalSKU} шт. Сумма: {totalSum.toFixed(0)} ₽
        </p>
      </div>
    );
  };

  useEffect(() => {
    setTotalSum(formData.items.reduce((sum, i) => sum + i.quantity * (i.unitPrice - (i.bonusStock || 0)), 0));
  }, [formData.items]);

  return (
    <Form method="post" action='/doc'>
      <input type="hidden" name="id" value={formData.doc._id || ''} />
      <input type="hidden" name="doc" value={JSON.stringify(formData.doc)} />
      <input type="hidden" name="items" value={JSON.stringify(formData.items)} />
      <input type="hidden" name="search" value={search} />

      {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>}

      <div className={styles.content}>
        <HeaderForm
          docAndItems={{ doc: formData.doc, items: formData.items }}
          isEditing={isEditing}
          setIsEditing={setIsEditing} // Теперь можно изменить, если нужно
          setDocAndItems={setFormData}
          cancel={() => navigate(-1)}
        />
        {/* Сумма документа */}
        {renderFooter()}

        {/* Кнопка "Добавить позицию" (только в режиме редактирования) */}
        {isEditing && (
          <div className={styles.actions}>
            <Button
              bgColor="#28a745"
              textColor="#fff"
              onClick={() => setFormData(prev => ({ ...prev, items: ([newDocItem, ...prev.items]) }))}
              text="Добавить позицию"
            />
          </div>
        )}

        {formData.items.length === 0 ? (
          <p className={styles.empty}>Нет позиций</p>
        ) : (
          <ul className={styles.itemsList}>
            {formData.items.map((item) => (
              <li key={item._id} className={styles.item}>
                {/* ✅ Всегда показываем EditableItem, т.к. isEditing === true */}
                <EditableItem
                  key={item._id}
                  docItem={item}
                  onUpdate={(updated) =>
                    setFormData(prev => ({
                      ...prev,
                      items: prev.items.map(i => i._id === updated._id ? updated : i)
                    }))
                  }
                  onDelete={(deleted) =>
                    setFormData(prev => ({
                      ...prev,
                      items: prev.items.filter((i) => i._id !== deleted._id)
                    }))
                  }
                />
                <hr className={styles.separator} />
              </li>
            ))}
          </ul>
        )}

      </div>
      {/* Кнопки управления */}
      <div className={styles.actions}>
        { formData.doc._id ? (
          <div className={styles.buttonGroup}>
            <Button
              type="submit" // ✅ Кнопка отправки формы
              name='_method'
              value='PATCH'
              className={styles.button}
              // onClick={handleSave} // ✅ Передаём функцию, не вызываем
              bgColor="#007bff"
              textColor="#fff"
              icon="FaRegFloppyDisk"
            />
            <Button
              className={styles.button}
              onClick={() => navigate(-1)}
              bgColor="#grey"
              textColor="#fff"
              icon="FaBackwardStep"
            />
            <Button
              type="submit"
              name='_method'
              value='DELETE'
              className={styles.button}
              onClick={(e) => { window.confirm('Вы уверены, что хотите удалить документ?') ? true : e.preventDefault() }}
              bgColor="#d32f2f"
              textColor="#fff"
              icon="FaTrash"
            />
          </div>
        ) : (
          <div className={styles.buttonGroup}>
            <Button
              className={styles.button}
              type="submit" // ✅ Кнопка отправки формы
              name='_method'
              value='POST'
              // onClick={handleSave} // ✅ Передаём функцию, не вызываем
              bgColor="#28a745"
              textColor="#fff"
              icon="FaRegFloppyDisk"
            />
            <Button
              className={styles.button}
              onClick={() => navigate(-1)}
              bgColor="#6c757d"
              textColor="#fff"
              icon="FaBackwardStep"
            />
          </div>
        )}
      </div>

    </Form>
  );
};

export default DocForm;