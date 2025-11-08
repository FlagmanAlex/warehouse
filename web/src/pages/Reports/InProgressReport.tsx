// InProgressReport.tsx
import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import type { IProduct } from '@warehouse/interfaces';
import { formatCurrency } from '../../utils/formatDate';

interface DocItem {
  _id: string;
  productId: IProduct
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
  const { response: data } = useLoaderData() as { response: CustomerGroup[] };
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (docId: string) => {
    setExpandedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };


  // Общая сумма по всем клиентам
  const totalReportSum = data.reduce((sum, customer) => sum + customer.totalSum, 0);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        Нет документов со статусом "В работе"
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '16px', color: '#333' }}>Отчёт: Документы "В работе"</h2>

      {/* Общая сумма отчёта */}
      <div style={{ marginBottom: '24px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
        Общая сумма: {formatCurrency(totalReportSum)}
      </div>

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
                <div
                  onClick={() => toggleDoc(doc._id)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <strong>Заказ:</strong> {doc.docNum} от {formatDate(doc.docDate)}
                  </div>
                  <div>
                     {doc.docTotalQty} шт. Сумма: {formatCurrency(doc.docTotalSum)}
                  </div>
                </div>

                {/* Сразу показываем позиции при раскрытии */}
                {expandedDocs[doc._id] && (
                  <div style={{ padding: '12px', backgroundColor: '#fff' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {/* <th style={tableHeaderStyle}>Артикул</th> */}
                            <th style={tableHeaderStyle}>Наименование</th>
                            <th style={tableHeaderStyle}>Кол-во</th>
                            <th style={tableHeaderStyle}>Цена</th>
                            {/* <th style={tableHeaderStyle}>Сумма</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {doc.items.map(item => (
                            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                              {/* <td style={tableCellStyle}>{item.productId.article}</td> */}
                              <td style={tableCellStyle}>{`${item.productId.article} ${item.productId.name}`}</td>
                              <td style={tableCellStyle}>{item.quantity}</td>
                              <td style={tableCellStyle}>{formatCurrency(item.unitPrice)}</td>
                              <td style={tableCellStyle}>
                                {/* {formatCurrency(item.quantity * item.unitPrice)} */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f0f8ff',
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '10px',
  fontWeight: 'bold',
  color: '#333',
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '10px',
  color: '#555',
};