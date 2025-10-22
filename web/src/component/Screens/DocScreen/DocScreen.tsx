// DocScreen.tsx
import { useEffect } from 'react';
import {
  Form,
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from 'react-router-dom';
import { Button } from '../../../shared/Button';
import { StatusIcon } from './StatusIcon';
import type { DocDto } from '@warehouse/interfaces/DTO';
import { DocStatusOrderMap, THEME } from '@warehouse/interfaces/config';
import styles from './DocScreen.module.css';
import { Icon } from '../../../shared/Icon';
import { TextField } from '../../../shared/TextFields';
import { formatDate } from '../../../utils/formatDate';
import { DocStatusInMap, DocStatusOutMap, DocTypeMap } from '@warehouse/interfaces/config';

export interface LoaderData {
  docs: DocDto[];
  filters: {
    startDate: string;
    endDate: string;
    docType: string | null;
    docStatus: string | null;
    search: string;
    filterShow: boolean;
  };
}

export default () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Получаем location
  const revalidator = useRevalidator(); // ✅ revalidator в DocScreen
  const [searchParams, setSearchParams] = useSearchParams();
  const { docs, filters } = useLoaderData() as LoaderData;

  const filterShow: boolean = filters.filterShow || false;
  const startDateStr: string = filters.startDate;
  const endDateStr: string = filters.endDate;
  const selectedDocType = filters.docType || null;
  const selectedStatus = filters.docStatus || null;
  const search = filters.search || '';

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);


  //Обновляем URL при изменении фильтров
  const updateFilters = (newParams: Record<string, string | boolean | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(newParams).forEach((key) => {
      const value = newParams[key];
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value as string);
      }
    });
    setSearchParams(params, { replace: true });
  };


  // Фильтрация документов
  const filteredDocs = docs.filter((item) => {
    const itemDate = new Date(item.docDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (itemDate < start || itemDate > end) return false;

    if (selectedDocType && item.docType !== selectedDocType) return false;
    if (selectedStatus && item.docStatus !== selectedStatus) return false;

    if (search) {
      const query = search.toLowerCase();
      const customerMatch =
        (item.docType === 'Outgoing' || item.docType === 'OrderOut') && item.customerId?.name.toLowerCase().includes(query);
      const supplierMatch =
        item.docType === 'Incoming' && item.supplierId?.name.toLowerCase().includes(query);
      if (!customerMatch && !supplierMatch) return false;
    }

    return true;
  });

  // ✅ Обновляем данные при монтировании, если пришли с формы
  useEffect(() => {
    revalidator.revalidate();
  }, [location.pathname]);

 
  // Рендер одного документа
  const renderDocItem = (item: DocDto) => (
    console.log('renderDocItem', item),
    <div key={item._id} className={`${styles.docItem} ${styles[item.priority || '']}`}
      onClick={() => navigate(`/doc/${item._id}?${searchParams.toString()}`)}
    >
      <div className={styles.header}>
        <span className={styles.subtitle}>№{item.docNum}</span>
        <span
          className={styles.subtitle}
          style={{
            color: item.docType === 'Outgoing' ? '#008000' : '#ff0000',
          }}
        >
          {DocTypeMap[item.docType].nameRus}
        </span>
        <span className={styles.subtitle}>
          Дата: {new Date(item.docDate).toLocaleDateString()}
        </span>

      </div>
      {(item.docType === 'Incoming' || item.docType === 'OrderIn') && (
        <div className={styles.content}>
          <span className={styles.subtitle}>Поставщик: {item.supplierId?.name}</span>
        </div>
      )}
      {(item.docType === 'Outgoing' || item.docType === 'OrderOut') && (
        <div className={styles.content}>
          <span className={styles.subtitle}>Клиент: {item.customerId?.name}</span>
          <div>
            <a href={`tel:${item.customerId?.phone}`} onClick={(e) => e.stopPropagation()}>
              <span className={styles.docChip}>тел.: {item.customerId?.phone}</span>
            </a>
            <a href={`geo:${item.addressId?.gps}`} onClick={(e) => e.stopPropagation()}>
              <span className={styles.docChip}>Адрес: {item.addressId?.address} </span>
            </a>
            <span className={styles.description}>{item.description}</span>
          </div>
        </div>
      )}

      <div className={styles.control}>
        <div className={styles.controlButton}>
          {item._id && <StatusIcon
            docType={item.docType}
            status={item.docStatus}
            docId={item._id}
          />} 
        </div>
        {item.docStatus === 'Draft' && ( 
        <Form method='post' action={`/doc/${item._id}?${searchParams.toString()}`} className={styles.controlButton}>
          <input type="hidden" name="id" value={item._id!} />
          <input type="hidden" name="doc" value={JSON.stringify(item)} />
          <input type="hidden" name="items" value={JSON.stringify({})} />
          <Button
            type='submit'
            icon='FaXmark'
            name='_method'
            value='DELETE'
            bgColor={THEME.color.white}
            textColor={THEME.color.red}
            className={styles.controlButton}
            onClick={(e) => { window.confirm('Вы действительно хотите удалить документ?') ? true : (e.preventDefault(), e.stopPropagation()); }}
          />
        </Form>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.docSumm}>Кол-во: <strong>{item.itemCount}</strong> шт. Сумма: <strong>{item.summ.toFixed(2)}</strong> руб.</span>
      </div>
    </div>
  );

  return (
    <>
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
              onClick={() => updateFilters({ filterShow: !filterShow })}
              bgColor={filterShow ? '#f0f0f0' : '#fff'}
              textColor="#007bff"
              bdColor='#007bff'
              icon={filterShow ? "FaAngleUp" : "FaAngleDown"}
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
                {Object.keys(DocTypeMap).map((type) => (
                  <div key={type} className={styles.filterRow}>
                    <Icon
                      size={24}
                      key={type}
                      name={DocTypeMap[type as keyof typeof DocTypeMap].icon}
                      color={DocTypeMap[type as keyof typeof DocTypeMap].color}
                      onClick={() => updateFilters({ docType: selectedDocType === type ? null : type })}
                      className={`${styles.chip} ${selectedDocType === type ? styles.chipSelected : ''}`}
                    />
                    {type === 'OrderOut' && <hr />}
                  </div>
                ))}
              </div>

              {/* Фильтр по статусам расхода если docType === 'OrderIn' */}
              {selectedDocType === 'OrderIn' && (
                <div className={styles.filterRow}>
                  {Object.keys(DocStatusOrderMap).map((status) => (
                    <Icon
                      size={24}
                      key={status}
                      name={DocStatusOrderMap[status as keyof typeof DocStatusOrderMap].icon}
                      color={DocStatusOrderMap[status as keyof typeof DocStatusOrderMap].color}
                      onClick={() => updateFilters({ docStatus: selectedStatus === status ? null : status })}
                      className={styles.chip + ` ${selectedStatus === status ? styles.chipSelected : ''}`}
                    />
                  ))}
                </div>
              )}
              {/* Фильтр по статусам расхода если docType === 'OrderOut' */}
              {selectedDocType === 'OrderOut' && (
                <div className={styles.filterRow}>
                  {Object.keys(DocStatusOrderMap).map((status) => (
                    <Icon
                      size={24}
                      key={status}
                      name={DocStatusOrderMap[status as keyof typeof DocStatusOrderMap].icon}
                      color={DocStatusOrderMap[status as keyof typeof DocStatusOrderMap].color}
                      onClick={() => updateFilters({ docStatus: selectedStatus === status ? null : status })}
                      className={styles.chip + ` ${selectedStatus === status ? styles.chipSelected : ''}`}
                    />
                  ))}
                </div>
              )}
              {/* Фильтр по статусам расхода если docType === 'Outgoing' */}
              {selectedDocType === 'Outgoing' && (
                <div className={styles.filterRow}>
                  {Object.keys(DocStatusOutMap).map((status) => (
                    <Icon
                      size={24}
                      key={status}
                      name={DocStatusOutMap[status as keyof typeof DocStatusOutMap].icon}
                      color={DocStatusOutMap[status as keyof typeof DocStatusOutMap].color}
                      onClick={() => updateFilters({ docStatus: selectedStatus === status ? null : status })}
                      className={styles.chip + ` ${selectedStatus === status ? styles.chipSelected : ''}`}
                    />
                  ))}
                </div>
              )}

              {/* Фильтр по статусам прихода если docType === 'Incoming' */}
              {selectedDocType === 'Incoming' && (
                <div className={styles.filterRow}>
                  {Object.keys(DocStatusInMap).map((status) => (
                    <Icon
                      size={24}
                      key={status}
                      name={DocStatusInMap[status as keyof typeof DocStatusInMap].icon}
                      color={DocStatusInMap[status as keyof typeof DocStatusInMap].color}
                      onClick={() => updateFilters({ docStatus: selectedStatus === status ? null : status })}
                      className={styles.chip + ` ${selectedStatus === status ? styles.chipSelected : ''}`}
                    />
                  ))}
                </div>
              )}

              {/* Поиск */}
              <div className={styles.searchContainer}>
                <TextField
                  name='search'
                  placeholder="Поиск по клиенту или поставщику"
                  value={search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                />
              </div>

              {/* Кнопка создания */}
              {(selectedDocType === 'OrderOut' || selectedDocType === 'OrderIn') && (
                <Button
                  // className={styles.addButton}
                  bgColor={THEME.button.add}
                  textColor={THEME.color.white}
                  onClick={() => navigate(`/doc?${searchParams.toString()}`)}
                  icon={"FaPlus"}
                  bdColor='#007bff'
                />
              )}
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
    </>
  );
};