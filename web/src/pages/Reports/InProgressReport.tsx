// InProgressReport.tsx
import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';

// Типы для TypeScript (можно вынести в отдельный файл)
interface DocItem {
  _id: string;
  productId: { name: string; vendorCode: string };
  quantity: number;
  unitPrice: number;
}

interface Doc {
  _id: string;
  docNum: string;
  docDate: string;
  docTotalQty: number;
  docTotalSum: number;
  items: DocItem[];
}

interface CustomerGroup {
  customerId: string;
  customerName: string;
  totalPositions: number;
  totalSum: number;
  docs: Doc[];
}

export const InProgressReport = () => {
  const {response: data} = useLoaderData() as { response: CustomerGroup[] };
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleDoc = (docId: string) => {
    setExpandedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const toggleItems = (docId: string) => {
    setExpandedItems(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Форматирование суммы
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        Нет документов со статусом "В работе"
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '24px', color: '#333' }}>Отчёт: Документы "В работе"</h2>

      {data.map(customer => (
        <div
          key={customer.customerId}
          style={{
            marginBottom: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {/* Заголовок клиента */}
          <div
            style={{
              backgroundColor: '#f5f9ff',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: '#1976d2' }}>{customer.customerName}</h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Всего позиций: <strong>{customer.totalPositions}</strong> | 
                Сумма: <strong>{formatCurrency(customer.totalSum)}</strong>
              </div>
            </div>
          </div>

          {/* Документы клиента */}
          <div style={{ padding: '0 16px 16px' }}>
            {customer.docs.map(doc => (
              <div
                key={doc._id}
                style={{
                  marginTop: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                {/* Заголовок документа */}
                <div
                  onClick={() => toggleDoc(doc._id)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>Заказ:</strong> {doc.docNum} от {formatDate(doc.docDate)}
                  </div>
                  <div>
                    Позиций: {doc.docTotalQty} | Сумма: {formatCurrency(doc.docTotalSum)}
                  </div>
                </div>

                {/* Содержимое документа (разворачивается) */}
                {expandedDocs[doc._id] && (
                  <div style={{ padding: '12px', backgroundColor: '#fff' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <button
                        onClick={() => toggleItems(doc._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1976d2',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        {expandedItems[doc._id] ? 'Скрыть позиции' : 'Показать позиции'}
                      </button>
                    </div>

                    {/* Таблица позиций */}
                    {expandedItems[doc._id] && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={tableHeaderStyle}>Артикул</th>
                              <th style={tableHeaderStyle}>Наименование</th>
                              <th style={tableHeaderStyle}>Кол-во</th>
                              <th style={tableHeaderStyle}>Цена</th>
                              <th style={tableHeaderStyle}>Сумма</th>
                            </tr>
                          </thead>
                          <tbody>
                            {doc.items.map(item => (
                              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tableCellStyle}>{item.productId.vendorCode}</td>
                                <td style={tableCellStyle}>{item.productId.name}</td>
                                <td style={tableCellStyle}>{item.quantity}</td>
                                <td style={tableCellStyle}>{formatCurrency(item.unitPrice)}</td>
                                <td style={tableCellStyle}>
                                  {formatCurrency(item.quantity * item.unitPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Стили для таблицы
const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f0f8ff',
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333',
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '14px',
  color: '#555',
};