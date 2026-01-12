import { useEffect, useState } from 'react';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import type { DeliveryDto } from '@warehouse/interfaces/DTO';
import style from './DeliveryList.module.css';
import { Icon } from '../../../shared/Icon';
import { Button } from '../../../shared/Button';
import { THEME } from '@warehouse/config';
import { TextField } from '../../../shared/TextFields';

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

  const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDates(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const param = new URLSearchParams();
    param.set('startDate', dates.startDate);
    param.set('endDate', dates.endDate);
    navigate(`?${param.toString()}`);
  }, [dates]);


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

  return (
    <div className={style.ListContainer}>
      <h2>Документы доставки</h2>
      <div className={style.DateContainer}>
        <div className={style.DateBlock}>
          <TextField
            type="date"
            name="startDate"
            value={dates.startDate}
            onChange={handleChangeDate}
            placeholder="Дата начала"
          />
          <TextField
            type="date"
            name="endDate"
            value={dates.endDate}
            onChange={handleChangeDate}
            placeholder="Дата окончания"
          />
        </div>
      </div>
      <Button
        onClick={() => navigate("/delivery-form")}
        bgColor={THEME.button.apply}
        textColor={THEME.color.white}
        text="Создать документ доставки"
      />
      <ul className={style.ListBlock}>
        {filteredDeliveries.map((delivery, idx) => (
          <li key={idx}>
            <div className={style.Card} onClick={() => navigate(`/delivery-form/${delivery.deliveryDoc._id}`)}>
              <span className={style.CardDate}>
                Доставка на : <br />
                {new Date(delivery.deliveryDoc.date).toISOString().split('T')[0]} <br />
                {new Date(delivery.deliveryDoc.startTime).toLocaleTimeString().split(':')[0] + 
                ':' + new Date(delivery.deliveryDoc.startTime).toLocaleTimeString().split(':')[1]
                + ' - ' + new Date(delivery.deliveryItems.reduce((latest, current) => current.dTimePlan > latest.dTimePlan ? current : latest, delivery.deliveryItems[0]).dTimePlan).toLocaleTimeString().split(':')[0] +
                ':' + new Date(delivery.deliveryItems.reduce((latest, current) => current.dTimePlan > latest.dTimePlan ? current : latest, delivery.deliveryItems[0]).dTimePlan).toLocaleTimeString().split(':')[1]
                } 
                
              </span>
              <span className={style.CardCountDoc}>точек.: {delivery.deliveryItems.length}</span>
              <span className={style.CardCountEnt}>банок.: {delivery.deliveryDoc.totalCountEntity}</span>
              <span className={style.CardSum}>Сумма: {delivery.deliveryDoc.totalSum}</span>
              <span className={style.CardTools}>
                <Icon
                  className={style.IconDel}
                  name="FaX"
                  onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                    e.stopPropagation();
                    handleDeleteDelivery(delivery.deliveryDoc._id!);
                  }}
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