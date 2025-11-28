// DeliveryNew.tsx
import { useState, useEffect } from 'react';
import { Form, useLoaderData, useActionData, useNavigate } from 'react-router-dom';
import style from './DeliveryNew.module.css';
import type { DocOrderOutDto } from '@warehouse/interfaces/DTO';

interface DocForDelivery extends DocOrderOutDto {
  checked: boolean;
}

interface ApiDocResponse {
  _id: string;
  customerId: { name: string; phone: string };
  docs: DocOrderOutDto[];
  totalPositions: number;
  totalSum: number;
}

export const DeliveryNew = () => {
  const { deliveries } = useLoaderData() as { deliveries: ApiDocResponse[] };
  const actionData = useActionData() as { success?: boolean; error?: string } | undefined;
  const navigate = useNavigate();

  const [docs, setDocs] = useState<DocForDelivery[]>([]);

  // Загрузка документов при монтировании
  useEffect(() => {
    const flatDocs: DocOrderOutDto[] = deliveries.flatMap(item => item.docs);
    setDocs(flatDocs.map(doc => ({ ...doc, checked: false })));
  }, [deliveries]);

  // Перенаправление при успешном создании
  useEffect(() => {
    if (actionData?.success) {
      navigate('/delivery-planning');
    }
  }, [actionData, navigate]);

  const handleToggleDoc = (id: string) => {
    setDocs(prev =>
      prev.map(doc => (doc._id === id ? { ...doc, checked: !doc.checked } : doc))
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const checkedDocs = docs.filter(doc => doc.checked);
    if (checkedDocs.length === 0) {
      e.preventDefault();
      alert('Пожалуйста, выберите хотя бы один документ для доставки.');
      return;
    }
  };

  const selectedCount = docs.filter(d => d.checked).length;

  return (
    <div className={style.DeliveryContainer}>
      <Form className={style.DeliveryFormContainer} method="post" onSubmit={handleSubmit}>
        <h2>Создать документ доставки</h2>

        <div className={style.FormGroup}>
          <label>
            <span>Дата доставки</span>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
          </label>
        </div>

        <div className={style.TimeRow}>
          <div className={style.FormGroup}>
            <label>
              <span>Начало маршрута</span>
              <input type="time" name="startTime" required defaultValue="10:00" />
            </label>
          </div>
          <div className={style.FormGroup}>
            <label>
              <span>Время разгрузки</span>
              <input type="time" name="unloadTime" required defaultValue="00:05" />
            </label>
          </div>
          <div className={style.FormGroup}>
            <label>
              <span>Между точками</span>
              <input type="time" name="timeInProgress" defaultValue="00:10" />
            </label>
          </div>
        </div>

        <fieldset className={style.DocList}>
          <legend>
            Документы для доставки{' '}
            {selectedCount > 0 && <span className={style.SelectedCount}>({selectedCount} выбрано)</span>}
          </legend>

          {docs.length === 0 ? (
            <p className={style.EmptyMessage}>Нет документов со статусом «В доставке»</p>
          ) : (
            <div className={style.DocItems}>
              {docs.map(doc => (
                <label key={doc._id} className={style.DocItem}>
                  <input
                    className={style.DocCheckbox}
                    type="checkbox"
                    name="docIds"
                    value={doc._id}
                    checked={doc.checked}
                    onChange={() => handleToggleDoc(doc._id)}
                  />
                  <div className={style.DocInfo}>
                    <span className={style.DocName}>{doc.customerId?.name || '—'}</span>
                    <span className={style.DocDetails}>{doc.customerId?.phone || ''}</span>
                    <span className={style.ItemCount}>{doc.itemCount || '0'}</span>
                    <span className={style.DocSumm}>{doc.summ?.toLocaleString() || '0'} ₽</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {actionData?.error && <div className={style.ErrorMessage}>{actionData.error}</div>}
        {actionData?.success && <div className={style.SuccessMessage}>Доставка создана успешно!</div>}

        <div className={style.ButtonGroup}>
          <button type="submit" className={style.SubmitButton}>
            Создать доставку
          </button>
          <button type="button" className={style.CancelButton} onClick={() => navigate(-1)}>
            Отмена
          </button>
        </div>
      </Form>
    </div>
  );
};