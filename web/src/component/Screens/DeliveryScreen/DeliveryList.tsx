import { useState } from 'react';
import { Navigate, useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import type { DeliveryDto } from '@warehouse/interfaces/DTO';
import style from './DeliveryList.module.css';
import { Icon } from '../../../shared/Icon';

export const DeliveryList = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { deliveries, filters } = useLoaderData() as {
    deliveries: DeliveryDto[];
    filters: any;
  };

  if (!deliveries) {
    return <div>Loading...</div>;
  }

  const [dates, setDates] = useState({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDates(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    const params = new URLSearchParams(dates);
    params.set('docStatus', 'InDelivery');
    window.location.search = params.toString();
  };

  /** Удаление документа доставки
   * @param id - id документа
   * @returns void
   */
    const handleDeleteDelivery = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить документ доставки?')) {
      fetcher.submit(null,
        {
          method: 'delete',
          action: `/delivery-planning/${id}`
        }
      );
    }
  };


  const filteredDeliveries = deliveries.filter(
    d => new Date(d.deliveryDoc.date) >= new Date(dates.startDate) && new Date(d.deliveryDoc.date) <= new Date(dates.endDate)
  );
  console.log(filteredDeliveries);

  return (
    <div className={style.ListContainer}>
      <h2>Документы доставки</h2>
      <div className={style.DateContainer}>

        <div className={style.DateBlock}>
          <input
            type="date"
            name="startDate"
            value={dates.startDate}
            onChange={handleChangeDate}
          />
          <input
            type="date"
            name="endDate"
            value={dates.endDate}
            onChange={handleChangeDate}
          />
        </div>
        <button
          className={style.ApplyButton}
          onClick={handleFilter}
        >
          Применить фильтр
        </button>
      </div>
      <button onClick={() => window.location.href = "/delivery-planning/new"} className={style.CreateButton} >Создать новый документ доставки</button>
      <ul className={style.ListBlock}>
        {filteredDeliveries.map((delivery, idx) => (
          <li key={idx}>
            <div className={style.Card}>
              <span className={style.CardDate}>Доставка на : <br />{new Date(delivery.deliveryDoc.date).toISOString().split('T')[0]}</span>
              <span className={style.CardCountDoc}>точек.: {delivery.deliveryDoc.totalCountDoc}</span>
              <span className={style.CardCountEnt}>банок.: {delivery.deliveryDoc.totalCountEntity}</span>
              <span className={style.CardSum}>Сумма: {delivery.deliveryDoc.totalSum}</span>
              <span className={style.CardTools}>
                <Icon
                  className={style.IconEdit}
                  name="FaBars"
                  onClick={() => navigate(`/delivery-planning/${delivery.deliveryDoc._id}`)}
                  color='grey'
                />
                <Icon
                  className={style.IconDel}
                  name="FaX"
                  onClick={() => handleDeleteDelivery(delivery.deliveryDoc._id)}
                  color='red'
                />
              </span>
            </div>
          </li>
        ))}
      </ul>


    </div>
  );
};