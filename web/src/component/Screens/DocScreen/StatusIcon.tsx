// components/StatusIcon.tsx

import { useState } from 'react';
import { fetchApi } from '../../../utils/fetchApi';
import type { DocStatus, DocStatusOut } from '@warehouse/interfaces';
import { DOC_STATUS_OUT, DOCSTATUS_CHIP } from '../../../utils/statusLabels';
import { getStatusColor } from '../../../utils/iconName';
import { Icon } from '../../../shared/Icon';
import { useRevalidator } from 'react-router-dom';

// Допустимые переходы между статусами
const STATUS_TRANSITIONS: Record<DocStatusOut, DocStatusOut[]> = {
  Draft: ['Reserved', 'Canceled'],
  Reserved: ['Shipped', 'Canceled'],
  Shipped: ['Completed', 'Canceled'],
  Completed: [],
  Canceled: [],
};

type StatusIconProps = {
  status: DocStatus;
  docId: string;
  // onStatusChange: (newStatus: DocStatus) => void; // Колбэк для обновления в родителе
};

export const StatusIcon = ({ status, docId }: StatusIconProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const revalidator = useRevalidator();

  const availableStatuses = STATUS_TRANSITIONS[status as DocStatusOut] || [];

  const handleStatusChange = async (newStatus: DocStatus) => {
    try {
      await fetchApi(`doc/${docId}/status`, 'PUT', {
        status: newStatus,
      });

      revalidator.revalidate();
      // onStatusChange(newStatus); // Обновляем в UI
      setModalVisible(false);
    } catch (error) {
      window.alert('Ошибка! Не удалось изменить статус');
      console.error('Ошибка обновления статуса:', error);
    }
  };

  // Функция для получения иконки из react-icons/fa

  return (
    <>
      {/* Иконка статуса */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          availableStatuses.length > 0 && setModalVisible(true);
        }}
        style={styles.iconButton}
        aria-label="Изменить статус"
      >
        <Icon name={DOCSTATUS_CHIP[status as keyof typeof DOCSTATUS_CHIP]} size={30} color={getStatusColor(status)} />
      </button>

      {/* Модальное окно */}
      {modalVisible && (
        <div style={styles.modalOverlay} onClick={() => setModalVisible(false)}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()} // Не закрывать при клике внутри
          >
            <h3 style={styles.modalTitle}>Изменить статус</h3>

            {availableStatuses.length === 0 ? (
              <p style={styles.noOptions}>Нет доступных действий</p>
            ) : (
              availableStatuses.map((s: DocStatusOut) => (
                <button
                  key={s}
                  style={{
                    ...styles.statusOption,
                    ...(s === 'Canceled' ? styles.cancelOption : {}),
                  }}
                  onClick={() => handleStatusChange(s)}
                >
                  <Icon name={DOCSTATUS_CHIP[s as keyof typeof DOCSTATUS_CHIP]} size={20} color={getStatusColor(s)} />
                  <span
                    style={{
                      ...styles.optionText,
                      color: getStatusColor(s),
                    }}
                  >
                    {DOC_STATUS_OUT[s]}
                  </span>
                </button>
              ))
            )}

            <button
              style={styles.closeButton}
              onClick={() => setModalVisible(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};


// Стили (можно вынести в .css файл)
const styles: Record<string, React.CSSProperties> = {
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: 8,
    padding: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    marginBottom: '16px',
    color: '#333',
  },
  statusOption: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 20px',
    borderRadius: 8,
    margin: '4px 0',
    backgroundColor: '#f5f5f5',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontSize: '16px',
    fontWeight: '500' as const,
  },
  cancelOption: {
    backgroundColor: '#ffebee',
  },
  optionText: {
    fontSize: '16px',
    fontWeight: '500' as const,
    marginLeft: '10px',
  },
  noOptions: {
    fontSize: '16px',
    color: '#666',
    fontStyle: 'italic' as const,
    marginBottom: '16px',
  },
  closeButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#ddd',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500' as const,
    color: '#333',
  },
};