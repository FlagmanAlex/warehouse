import { useState } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { FaAngleDown, FaAngleUp, FaPlus } from 'react-icons/fa6';
import { Button } from '../../../shared/Button';
import { StatusIcon } from './StatusIcon';
import { DOC_TYPE, DOCSTATUS_CHIP, DOCTYPE_CHIP } from '../../../utils/statusLabels';
import type { DocDto } from '@warehouse/interfaces/DTO';
import { THEME } from '../../../utils/Default';

import styles from './DocScreen.module.css'; // ← CSS-файл ниже
import { getStatusColor } from '../../../utils/iconName';
import type { DocStatus } from '@warehouse/interfaces';
import { Icon } from '../../../shared/Icon';
import { TextField } from '../../../shared/TextFields';
import { formatDate } from '../../../utils/formatDate';

export interface LoaderData {
  docs: DocDto[];
  filters: {
    startDate: string;
    endDate: string;
    docType: string | null;
    docStatus: string | null;
    search: string;
  };
}




export const DocScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterShow, setFilterShow] = useState(false);
  const { docs, filters } = useLoaderData() as LoaderData

  const startDateStr: string = filters.startDate;
  const endDateStr: string = filters.endDate
  const selectedDocType = filters.docType || null;
  const selectedStatus = filters.docStatus || null;
  const search = filters.search || '';

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  //Обновляем URL при изменении фильтров
  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(newParams).forEach((key) => {
      const value = newParams[key];
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params, { replace: true });
  }

  // Фильтрация документов
  const filteredDocs = docs.filter((item) => {
    const itemDate = new Date(item.docDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (itemDate < start || itemDate > end) return false;

    if (selectedDocType && item.docType !== selectedDocType) return false;
    if (selectedStatus && item.status !== selectedStatus) return false;

    if (search) {
      const query = search.toLowerCase();
      const customerMatch =
        item.docType === 'Outgoing' && item.customerId?.name.toLowerCase().includes(query);
      const supplierMatch =
        item.docType === 'Incoming' && item.supplierId?.name.toLowerCase().includes(query);
      if (!customerMatch && !supplierMatch) return false;
    }

    return true;
  });

  // Рендер одного документа
  const renderDocItem = (item: DocDto) => (
    <div key={item._id} className={styles.docItem}>
      <div
        className={styles.docHeader}
        onClick={() => navigate(`/doc-form/${item._id}`, { state: { docId: item._id!, docType: item.docType } })}
      >
        <div className={styles.docRow}>
          <span className={styles.subtitle}>№{item.docNum}</span>
          <span
            className={styles.subtitle}
            style={{
              color: item.docType === 'Outgoing' ? '#008000' : '#ff0000',
            }}
          >
            {DOC_TYPE[item.docType]}
          </span>
          <span className={styles.subtitle}>
            Дата: {new Date(item.docDate).toLocaleDateString()}
          </span>

          <StatusIcon
            status={item.status}
            docId={item._id!}
          />
        </div>

        {item.docType === 'Incoming' && (
          <span className={styles.subtitle}>Поставщик: {item.supplierId?.name}</span>
        )}
        {item.docType === 'Outgoing' && (
          <span className={styles.subtitle}>Клиент: {item.customerId?.name}</span>
        )}

        <span className={styles.docId}>ID документа: {item._id}</span>
      </div>

      <div className={styles.summContainer}>
        <span className={styles.docSumm}>Сумма: {item.summ.toFixed(2)} руб.</span>
      </div>
    </div>
  );

  return (
    <div className={styles.docContainer}>
      {/* Контроллеры выбора дат */}
      <div className={styles.filterContainer}>
        <div className={styles.datePickers}>
          <input
            type="date"
            value={formatDate(startDate)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              updateFilters({ startDate: formatDate(newDate) });
            }}
            className={styles.dateInput}
          />

          <Button
            onClick={() => setFilterShow(!filterShow)}
            bgColor={filterShow ? '#f0f0f0' : '#fff'}
            textColor="#007bff"
            bdColor='#007bff'
            text={filterShow ? <FaAngleUp size={24} /> : <FaAngleDown size={24} />}
          />


          <input
            type="date"
            value={formatDate(endDate)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              updateFilters({ endDate: formatDate(newDate) });
            }}
            className={styles.dateInput}
          />
        </div>
        {/* Фильтры */}
        {filterShow && (
          <>
            {/* Фильтр по типу документа */}
            <div className={styles.filterRow}>
              {Object.keys(DOCTYPE_CHIP).map((type) => (
                <Icon
                  size={24}
                  key={type}
                  name={DOCTYPE_CHIP[type as keyof typeof DOCTYPE_CHIP]}
                  color="#333"
                  onClick={() => updateFilters({ docType: selectedDocType === type ? null : type })}
                  className={`${styles.chip} ${selectedDocType === type ? styles.chipSelected : ''}`}
                />
              ))}
            </div>

            {/* Фильтр по статусу */}
            <div className={styles.filterRow}>
              {Object.keys(DOCSTATUS_CHIP).map((status) => (
                <Icon
                  size={24}
                  key={status}
                  name={DOCSTATUS_CHIP[status as keyof typeof DOCSTATUS_CHIP]}
                  color={getStatusColor(status as DocStatus)}
                  onClick={() => updateFilters({ docStatus: selectedStatus === status ? null : status })}
                  className={styles.chip + ` ${selectedStatus === status ? styles.chipSelected : ''}`}
                />
              ))}
            </div>

            {/* Поиск */}
            <div className={styles.searchContainer}>
              <TextField
                name='search'
                label="Поиск по клиенту или поставщику"
                value={search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              // className="search-input"
              />
            </div>

            {/* Кнопка создания */}
            <Button
              bgColor={THEME.button.add}
              textColor={THEME.color.white}
              onClick={() =>
                navigate(`/doc-form`)
              }
              text={<FaPlus color='#fff' />}
              bdColor='#007bff'
            />
          </>
        )}
      </div>


      <div className={styles.docList}>
        {filteredDocs.length > 0 ? (
          filteredDocs.map(renderDocItem)
        ) : (
          <p className={styles.noDocs}>Документы не найдены</p>
        )}
      </div>
    </div>
  );
};

export default DocScreen;