// DeliveryForm.tsx
import { useState, useEffect } from 'react';
import { Form, useLoaderData, useActionData, useNavigate, useParams } from 'react-router-dom';
import style from './DeliveryForm.module.css';
import type { DocOrderOutDto, DeliveryDto } from '@warehouse/interfaces/DTO';

interface DocForDelivery extends DocOrderOutDto {
  checked: boolean;
}

interface LoaderData {
  // Для редактирования
  delivery?: DeliveryDto;
  // Для создания / дополнения
  availableDocs: DocOrderOutDto[];
}

export const DeliveryForm = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const { delivery, availableDocs } = useLoaderData() as LoaderData;
  const actionData = useActionData() as { success?: boolean; error?: string } | undefined;
  const navigate = useNavigate();

  // Состояние документов: уже выбранные + доступные для добавления
  const [selectedDocs, setSelectedDocs] = useState<DocForDelivery[]>([]);
  const [availableDocsState, setAvailableDocsState] = useState<DocForDelivery[]>([]);

  // Инициализация при загрузке
  useEffect(() => {
    if (isEditing && delivery) {
      // При редактировании: выбранные — из delivery, доступные — можно обновить позже
      const selected = delivery.deliveryDoc.docs.map(doc => ({ ...doc, checked: true }));
      setSelectedDocs(selected);
    }
    // Доступные документы (InDelivery) — всегда из loader'а
    setAvailableDocsState(availableDocs.map(doc => ({ ...doc, checked: false })));
  }, [delivery, availableDocs, isEditing]);

  // При создании: все документы изначально в "доступных", но не выбраны
  useEffect(() => {
    if (!isEditing) {
      setSelectedDocs([]);
    }
  }, [isEditing]);

  // Обработчики
  const toggleSelectedDoc = (docId: string) => {
    setSelectedDocs(prev =>
      prev.map(doc => (doc._id === docId ? { ...doc, checked: !doc.checked } : doc))
    );
  };

  const toggleAvailableDoc = (docId: string) => {
    setAvailableDocsState(prev =>
      prev.map(doc => (doc._id === docId ? { ...doc, checked: !doc.checked } : doc))
    );
  };

  const handleAddSelectedAvailable = () => {
    const newlySelected = availableDocsState.filter(d => d.checked);
    if (newlySelected.length === 0) {
      alert('Выберите документы для добавления');
      return;
    }
    setSelectedDocs(prev => [
      ...prev.filter(d => !newlySelected.some(ns => ns._id === d._id)), // избегаем дублей
      ...newlySelected.map(d => ({ ...d, checked: true })),
    ]);
    // Снимаем выделение
    setAvailableDocsState(prev => prev.map(d => (d.checked ? { ...d, checked: false } : d)));
  };

  const handleRemoveSelected = (docId: string) => {
    if (isEditing) {
      if (window.confirm('Удалить документ из доставки?')) {
        setSelectedDocs(prev => prev.filter(d => d._id !== docId));
      }
    } else {
      setSelectedDocs(prev => prev.filter(d => d._id !== docId));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (selectedDocs.length === 0) {
      e.preventDefault();
      alert('Выберите хотя бы один документ для доставки');
    }
  };

  const selectedCount = selectedDocs.filter(d => d.checked).length;

  return (
    <div className={style.DeliveryContainer}>
      <Form className={style.DeliveryFormContainer} method="post" onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Редактировать доставку' : 'Создать доставку'}</h2>

        {/* Скрытый ID при редактировании */}
        {isEditing && <input type="hidden" name="deliveryId" value={id} />}

        {/* Дата доставки */}
        <div className={style.FormGroup}>
          <label>
            <span>Дата доставки</span>
            <input
              type="date"
              name="date"
              defaultValue={
                isEditing
                  ? new Date(delivery!.deliveryDoc.date).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
              required
            />
          </label>
        </div>

        {/* Время */}
        <div className={style.TimeRow}>
          <div className={style.FormGroup}>
            <label>
              <span>Начало маршрута</span>
              <input
                type="time"
                name="startTime"
                required
                defaultValue={isEditing ? delivery!.deliveryDoc.startTime : '10:00'}
              />
            </label>
          </div>
          <div className={style.FormGroup}>
            <label>
              <span>Время разгрузки</span>
              <input
                type="time"
                name="unloadTime"
                required
                defaultValue={isEditing ? delivery!.deliveryDoc.unloadTime : '00:05'}
              />
            </label>
          </div>
          <div className={style.FormGroup}>
            <label>
              <span>Между точками</span>
              <input
                type="time"
                name="timeInProgress"
                defaultValue={isEditing ? delivery!.deliveryDoc.timeInProgress : '00:10'}
              />
            </label>
          </div>
        </div>

        {/* Выбранные документы */}
        <fieldset className={style.DocList}>
          <legend>
            Выбранные документы{' '}
            {selectedCount > 0 && <span className={style.SelectedCount}>({selectedCount})</span>}
          </legend>
          {selectedDocs.length === 0 ? (
            <p className={style.EmptyMessage}>Нет выбранных документов</p>
          ) : (
            <div className={style.DocItems}>
              {selectedDocs.map(doc => (
                <div key={doc._id} className={style.DocItem}>
                  <div className={style.DocInfo}>
                    <span className={style.DocName}>{doc.customerId?.name || '—'}</span>
                    <span className={style.DocDetails}>{doc.customerId?.phone || ''}</span>
                  </div>
                  <span className={style.DocSumm}>{doc.summ?.toLocaleString() || '0'} ₽</span>
                  <button
                    type="button"
                    className={style.RemoveButton}
                    onClick={() => handleRemoveSelected(doc._id)}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        {/* Доступные документы для добавления */}
        <fieldset className={style.DocList}>
          <legend>Доступные документы (InDelivery)</legend>
          {availableDocsState.length === 0 ? (
            <p className={style.EmptyMessage}>Нет новых документов в статусе «В доставке»</p>
          ) : (
            <>
              <div className={style.DocItems}>
                {availableDocsState.map(doc => (
                  <label key={doc._id} className={style.DocItem}>
                    <input
                      type="checkbox"
                      checked={doc.checked}
                      onChange={() => toggleAvailableDoc(doc._id)}
                    />
                    <div className={style.DocInfo}>
                      <span className={style.DocName}>{doc.customerId?.name || '—'}</span>
                      <span className={style.DocDetails}>{doc.customerId?.phone || ''}</span>
                    </div>
                    <span className={style.DocSumm}>{doc.summ?.toLocaleString() || '0'} ₽</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className={style.AddButton}
                onClick={handleAddSelectedAvailable}
              >
                Добавить выбранные
              </button>
            </>
          )}
        </fieldset>

        {actionData?.error && <div className={style.ErrorMessage}>{actionData.error}</div>}
        {actionData?.success && <div className={style.SuccessMessage}>Сохранено!</div>}

        <div className={style.ButtonGroup}>
          <button type="submit" className={style.SubmitButton}>
            {isEditing ? 'Сохранить изменения' : 'Создать доставку'}
          </button>
          <button type="button" className={style.CancelButton} onClick={() => navigate(-1)}>
            Отмена
          </button>
        </div>
      </Form>
    </div>
  );
};