import { useEffect, useState } from 'react';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import type { DeliveryDto } from '@warehouse/interfaces/DTO';
import style from './DeliveryList.module.css';
import { Icon } from '../../../../shared/Icon';
import { Button } from '../../../../shared/Button';
import { THEME } from '@warehouse/config';
import { TextField } from '../../../../shared/TextFields';

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

  /** Функция расчета процента выполнения по количеству точек */
  const calculateCompletionPercentage = (delivery: DeliveryDto) => {
    if (!delivery.deliveryItems.length) return 0;
    const completedItems = delivery.deliveryItems.filter(item => item.dTimeFact !== undefined).length;
    return (completedItems / delivery.deliveryItems.length) * 100;
  };

  /** Функция расчета выполнения по банкам */
  const getCompletedBanks = (delivery: DeliveryDto) => {
    const completedItems = delivery.deliveryItems.filter(item => item.dTimeFact !== undefined);
    const totalBanks = completedItems.reduce((sum, item) => sum + (item.entityCount || 0), 0);
    return totalBanks;
  };

  /** Функция расчета выполнения по сумме */
  const getCompletedSum = (delivery: DeliveryDto) => {
    const completedItems = delivery.deliveryItems.filter(item => item.dTimeFact !== undefined);
    const totalSum = completedItems.reduce((sum, item) => sum + (item.summ || 0), 0);
    return totalSum;
  };

  /** Функция для получения временного диапазона доставки */
  const getDeliveryTimeRange = (delivery: DeliveryDto) => {
    if (!delivery.deliveryItems.length) {
      return 'Нет данных о времени';
    }
    
    const startTime = new Date(delivery.deliveryDoc.startTime);
    const startTimeStr = startTime.toLocaleTimeString().slice(0, 5);
    
    const latestItem = delivery.deliveryItems.reduce((latest, current) => 
      current.dTimePlan > latest.dTimePlan ? current : latest
    );
    
    const endTime = new Date(latestItem.dTimePlan);
    const endTimeStr = endTime.toLocaleTimeString().slice(0, 5);
    
    return `${startTimeStr} - ${endTimeStr}`;
  };

  /** Компонент прогресс-бара для карточки */
  const ProgressBarInCard = ({ delivery }: { delivery: DeliveryDto }) => {
    const percentage = calculateCompletionPercentage(delivery);
    const completedCount = delivery.deliveryItems.filter(item => item.dTimeFact !== undefined).length;
    const totalCount = delivery.deliveryItems.length;
    
    const getProgressColor = () => {
      if (percentage === 100) return '#4caf50';
      return '#ffc107';
    };
    
    return (
      <div className={style.progressBarContainer}>
        <div className={style.progressBarTrack}>
          <div 
            className={style.progressBarFill}
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getProgressColor()
            }}
          >
            <span className={style.progressBarText}>
              {completedCount} / {totalCount} ({Math.round(percentage)}%)
            </span>
          </div>
        </div>
      </div>
    );
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
        {filteredDeliveries.map((delivery, idx) => {
          const completedCount = delivery.deliveryItems.filter(item => item.dTimeFact !== undefined).length;
          const totalCount = delivery.deliveryItems.length;
          const completedBanks = getCompletedBanks(delivery);
          const totalBanks = delivery.deliveryDoc.totalCountEntity;
          const completedSum = getCompletedSum(delivery);
          const totalSum = delivery.deliveryDoc.totalSum;
          
          return (
            <li key={idx}>
              <div className={style.Card} onClick={() => navigate(`/delivery-form/${delivery.deliveryDoc._id}`)}>
                <span className={style.CardDate}>
                  Доставка на : <br />
                  {new Date(delivery.deliveryDoc.date).toISOString().split('T')[0]} <br />
                  {getDeliveryTimeRange(delivery)}
                </span>
                <span className={style.CardCountDoc}>
                  Точек: {completedCount} / {totalCount}
                </span>
                <span className={style.CardCountEnt}>
                  Банок: {completedBanks} / {totalBanks}
                </span>
                <span className={style.CardSum}>
                  Сумма: {completedSum} / {totalSum}
                </span>
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
                {/* Добавляем прогресс-бар в карточку */}
                <ProgressBarInCard delivery={delivery} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};