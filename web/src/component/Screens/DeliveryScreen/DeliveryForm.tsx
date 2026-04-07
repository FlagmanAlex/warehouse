import { useFetcher, useLoaderData } from 'react-router-dom'
import style from './DeliveryForm.module.css'
import type { DeliveryDto, DeliveryItemsDTO, DocOrderOutDto } from '@warehouse/interfaces/DTO'
import { useEffect, useState } from 'react'
import { TextField } from '../../../shared/TextFields'
import { Button } from '../../../shared/Button'
import { Icon } from '../../../shared/Icon'
import { THEME } from '@warehouse/config'
import { DeliveryInfoOrders } from './UI/DeliveryInfoOrders'

interface IDocStatusDelivery {
    customerId: string;
    customerName: string;
    docs: DocOrderOutDto[]
}
export const DeliveryForm = () => {

    const [deliveryEdit, setdeliveryEdit] = useState(false)
    const { delivery: { deliveryDoc, deliveryItems }, docStatusDelivery } = useLoaderData()
    const [sliderValues, setSliderValues] = useState<Record<string, number>>({})
    const [delivery, setDelivery] = useState<DeliveryDto>({ deliveryDoc, deliveryItems })
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [openModalTimePlan, setOpenModalTimePlan] = useState<boolean>(false)
    const [selectIds, setSelectIds] = useState<string[]>([])
    const [newPlanTime, setNewPlanTime] = useState<string>('00:00')
    // Состояние для модалки с информацией о заказах
    const [infoModalDocIds, setInfoModalDocIds] = useState<string[]>([]);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);

    const fetcher = useFetcher()

    useEffect(() => {
        if (!delivery.deliveryItems.length) return;

        const sorted = [...delivery.deliveryItems].sort((a, b) =>
            new Date(a.dTimePlan).getTime() - new Date(b.dTimePlan).getTime()
        );

        const initialValues: Record<string, number> = {};
        sorted.forEach((item, index) => {
            if (!item._id) return;
            if (index === 0) {
                initialValues[item._id] = 0;
                return;
            }

            const prevTime = new Date(sorted[index - 1].dTimePlan).getTime();
            const currTime = new Date(item.dTimePlan).getTime();

            if (isNaN(prevTime) || isNaN(currTime)) {
                initialValues[item._id] = 0;
                return;
            }

            const diffMin = (currTime - prevTime) / 60000;
            // Переводим минуты в шаги ползунка (1 шаг = 5 мин), ограничиваем 0-12
            initialValues[item._id] = Math.max(0, Math.min(12, Math.round(diffMin / 5)));
        });

        setSliderValues(initialValues);
    }, [delivery.deliveryItems])


    useEffect(() => {
        if (fetcher.data?.success && fetcher.data?.data) {
            // Обновляем данные при любом успешном ответе (POST, PATCH)
            setDelivery(fetcher.data.data)
            setSelectIds([])
        }
    }, [fetcher.data])


    // console.log(openModal, docStatusDelivery);

    const handleOpenModal = () => {
        const currentDocIds = delivery.deliveryItems.map(item => item.docIds.map(docId => docId)).flat();
        setSelectIds(currentDocIds);
        setOpenModal(true)
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewPlanTime(e.target.value)
    }

    const handleApplyTimePlan = () => {
        if (!editingItemId) return;

        // Берём текущую дату из deliveryDoc.date или из старого dTimePlan
        const item = delivery.deliveryItems.find(i => i._id === editingItemId);
        if (!item) return;

        // Извлекаем дату (день, месяц, год) из старого dTimePlan
        const oldDate = new Date(item.dTimePlan);
        const [hours, minutes] = newPlanTime.split(':').map(Number);

        const newDateTime = new Date(oldDate);
        newDateTime.setHours(hours, minutes, 0, 0);

        // Обновляем deliveryItems
        const updatedDeliveryItems = delivery.deliveryItems.map(i =>
            i._id === editingItemId ? { ...i, dTimePlan: newDateTime } : i
        );

        const updatedDelivery = {
            deliveryDoc: delivery.deliveryDoc,
            deliveryItems: updatedDeliveryItems
        };

        // ✅ Отправляем через существующий fetcher с PATCH
        const formData = new FormData();
        formData.append('delivery', JSON.stringify(updatedDelivery));
        // Если ваш бэкенд ожидает docIds — добавьте их (возможно, не нужно)
        // delivery.deliveryItems.forEach(item => formData.append('docIds', item.docId));

        fetcher.submit(formData, {
            method: 'PATCH',
            action: `/delivery-planning/${delivery.deliveryDoc._id}`
        });

        // Обновляем локальное состояние
        setDelivery({
            deliveryDoc: updatedDelivery.deliveryDoc,
            deliveryItems: updatedDeliveryItems
        });

        // Закрываем модалку
        setOpenModalTimePlan(false);
        setEditingItemId(null);
    };

    const handleChangesPlanDate = (id: string, dTimePlan: Date | string): void => {
        const dateObj = new Date(dTimePlan);

        // Защита от Invalid Date
        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date passed to handleChangesPlanDate:', dTimePlan);
            setNewPlanTime('00:00');
        } else {
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            setNewPlanTime(`${hours}:${minutes}`);
        }

        setEditingItemId(id);
        setOpenModalTimePlan(true);
    };

    const handleOpenMap = () => {
        window.open(`https://yandex.ru/maps/?mode=routes&rtext=47.0995%2C37.5493~${delivery.deliveryItems.map(item => item.addressId.gps.replace(',', '%2C')).join('~')
            }~47.0995%2C37.5493`, '_blank');
    }
    const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        switch (e.target.type) {
            case 'date':
                value && setDelivery(prev => ({
                    ...prev, deliveryDoc: {
                        ...prev.deliveryDoc,
                        [name]: new Date(value)
                    }
                }));
                break;
            case 'time':
                value && setDelivery(prev => ({
                    ...prev, deliveryDoc: {
                        ...prev.deliveryDoc,
                        [name]: new Date(prev.deliveryDoc.date).setHours(Number(value.split(':')[0]), Number(value.split(':')[1]), 0)
                    }
                }));
                break;
        }
    }

    const handleCheckChange = (id: string | undefined) => {
        if (!id || fetcher.state !== 'idle') return; // ← блокируем, если идёт запрос

        // Найдём текущий элемент
        const item = delivery.deliveryItems.find(i => i._id === id);
        if (!item) return;

        // Инвертируем dTimeFact
        const newDTimeFact = item.dTimeFact ? undefined : new Date();

        // Обновляем локально
        const updatedDeliveryItems = delivery.deliveryItems.map(i =>
            i._id === id ? { ...i, dTimeFact: newDTimeFact } : i
        );

        const updatedDelivery = {
            deliveryDoc: delivery.deliveryDoc,
            deliveryItems: updatedDeliveryItems
        };

        // ✅ Отправляем на сервер
        const formData = new FormData();
        formData.append('delivery', JSON.stringify(updatedDelivery));

        fetcher.submit(formData, {
            method: 'PATCH',
            action: `/delivery-planning/${delivery.deliveryDoc._id}`
        });

        // Обновляем локальное состояние
        setDelivery(updatedDelivery)
    }
    const handleApply = () => {
        if (!selectIds.length) return
        const formData = new FormData();
        selectIds.map(id => formData.append('docIds', id));
        formData.append('delivery', JSON.stringify(delivery.deliveryDoc));

        setOpenModal(false)

        if (delivery.deliveryDoc._id) {
            fetcher.submit(formData, {
                action: `/delivery-planning/${delivery.deliveryDoc._id}`,
                method: 'PUT'
            })
        } else {
            fetcher.submit(formData, {
                action: '/delivery-planning',
                method: 'POST'
            })
        }
    }

    const handleOpenInfo = (id: string) => {
        // Находим элемент доставки по ID
        const item = delivery.deliveryItems.find(i => i._id === id);

        if (!item) {
            console.warn('Элемент не найден:', id);
            return;
        }

        // Извлекаем docIds. 
        // В вашем интерфейсе это массив, поэтому просто копируем его
        // Если docIds может быть вложенным, используйте .flat() как в handleOpenModal
        const docIds = Array.isArray(item.docIds)
            ? item.docIds
            : [item.docIds].filter(Boolean);

        if (docIds.length === 0) {
            alert('Нет заказов для отображения');
            return;
        }

        // Сохраняем ID и открываем модалку
        setInfoModalDocIds(docIds);
        setIsInfoModalOpen(true);
    }
    const handleMoveUpItem = (id: string) => {
        if (fetcher.state !== 'idle') return;

        // Находим индекс текущего элемента
        const currentIndex = delivery.deliveryItems.findIndex(i => i._id === id);
        if (currentIndex === -1 || currentIndex === 0) return; // Нельзя переместить выше первого

        // Сортируем элементы по dTimePlan для получения правильного порядка
        const sorted = [...delivery.deliveryItems].sort((a, b) =>
            new Date(a.dTimePlan).getTime() - new Date(b.dTimePlan).getTime()
        );

        // Находим индекс в отсортированном массиве
        const sortedIndex = sorted.findIndex(i => i._id === id);
        if (sortedIndex === -1 || sortedIndex === 0) return;

        // Меняем местами dTimePlan с предыдущим элементом
        const prevItem = sorted[sortedIndex - 1];
        const currentItem = sorted[sortedIndex];

        const tempTime = currentItem.dTimePlan;
        currentItem.dTimePlan = prevItem.dTimePlan;
        prevItem.dTimePlan = tempTime;

        // Обновляем состояние
        setDelivery(prev => ({
            ...prev,
            deliveryItems: [...delivery.deliveryItems] // Создаем новый массив для ререндера
        }));

        // Пересчитываем значения слайдеров
        const newSliderValues: Record<string, number> = {};
        const newSorted = [...delivery.deliveryItems].sort((a, b) =>
            new Date(a.dTimePlan).getTime() - new Date(b.dTimePlan).getTime()
        );

        newSorted.forEach((item, index) => {
            if (!item._id) return;
            if (index === 0) {
                newSliderValues[item._id] = 0;
                return;
            }

            const prevTime = new Date(newSorted[index - 1].dTimePlan).getTime();
            const currTime = new Date(item.dTimePlan).getTime();
            const diffMin = (currTime - prevTime) / 60000;
            newSliderValues[item._id] = Math.max(0, Math.min(12, Math.round(diffMin / 5)));
        });

        setSliderValues(newSliderValues);

        // Отправляем на сервер
        const formData = new FormData();
        formData.append('delivery', JSON.stringify({
            deliveryDoc: delivery.deliveryDoc,
            deliveryItems: delivery.deliveryItems
        }));

        fetcher.submit(formData, {
            method: 'PATCH',
            action: `/delivery-planning/${delivery.deliveryDoc._id}`
        });
    };
    const handleMoveDownItem = (id: string) => {
        if (fetcher.state !== 'idle') return;

        // Находим индекс текущего элемента
        const currentIndex = delivery.deliveryItems.findIndex(i => i._id === id);
        if (currentIndex === -1 || currentIndex === delivery.deliveryItems.length - 1) return;

        // Сортируем элементы по dTimePlan для получения правильного порядка
        const sorted = [...delivery.deliveryItems].sort((a, b) =>
            new Date(a.dTimePlan).getTime() - new Date(b.dTimePlan).getTime()
        );

        // Находим индекс в отсортированном массиве
        const sortedIndex = sorted.findIndex(i => i._id === id);
        if (sortedIndex === -1 || sortedIndex === sorted.length - 1) return;

        // Меняем местами dTimePlan со следующим элементом
        const nextItem = sorted[sortedIndex + 1];
        const currentItem = sorted[sortedIndex];

        const tempTime = currentItem.dTimePlan;
        currentItem.dTimePlan = nextItem.dTimePlan;
        nextItem.dTimePlan = tempTime;

        // Обновляем состояние
        setDelivery(prev => ({
            ...prev,
            deliveryItems: [...delivery.deliveryItems]
        }));

        // Пересчитываем значения слайдеров
        const newSliderValues: Record<string, number> = {};
        const newSorted = [...delivery.deliveryItems].sort((a, b) =>
            new Date(a.dTimePlan).getTime() - new Date(b.dTimePlan).getTime()
        );

        newSorted.forEach((item, index) => {
            if (!item._id) return;
            if (index === 0) {
                newSliderValues[item._id] = 0;
                return;
            }

            const prevTime = new Date(newSorted[index - 1].dTimePlan).getTime();
            const currTime = new Date(item.dTimePlan).getTime();
            const diffMin = (currTime - prevTime) / 60000;
            newSliderValues[item._id] = Math.max(0, Math.min(12, Math.round(diffMin / 5)));
        });

        setSliderValues(newSliderValues);

        // Отправляем на сервер
        const formData = new FormData();
        formData.append('delivery', JSON.stringify({
            deliveryDoc: delivery.deliveryDoc,
            deliveryItems: delivery.deliveryItems
        }));

        fetcher.submit(formData, {
            method: 'PATCH',
            action: `/delivery-planning/${delivery.deliveryDoc._id}`
        });
    };

    const handleProgressChange = (itemId: string, newSliderValue: number) => {
        const oldSliderValue = sliderValues[itemId] ?? 0;
        const deltaMin = (newSliderValue - oldSliderValue) * 5;
        const deltaMs = deltaMin * 60000;

        const sorted = [...delivery.deliveryItems].sort((a, b) =>
            new Date(a.dTimePlan).getTime() - new Date(b.dTimePlan).getTime()
        );

        const itemIndex = sorted.findIndex(i => i._id === itemId);
        if (itemIndex === -1) return;

        // Сдвигаем текущий и все последующие элементы на дельту
        const updatedItems = sorted.map((item, idx) => {
            if (idx < itemIndex) return item;
            const newTime = new Date(new Date(item.dTimePlan).getTime() + deltaMs);
            return { ...item, dTimePlan: newTime };
        });

        // Обновляем локальное состояние
        setDelivery(prev => ({
            ...prev,
            deliveryItems: updatedItems
        }));

        // Обновляем значение ползунка
        setSliderValues(prev => ({ ...prev, [itemId]: newSliderValue }));
    };

    // Отправка на сервер только после отпускания ползунка (защита от спама запросами)
    const handleProgressEnd = () => {
        if (fetcher.state !== 'idle') return;

        const formData = new FormData();
        formData.append('delivery', JSON.stringify({
            deliveryDoc: delivery.deliveryDoc,
            deliveryItems: delivery.deliveryItems
        }));

        fetcher.submit(formData, {
            method: 'PATCH',
            action: `/delivery-planning/${delivery.deliveryDoc._id}`
        });
    };

    const selectModalTimePlan = () => {
        return (
            <div className={style.modal}>
                <div className={style.modalOverlay} onClick={() => setOpenModalTimePlan(false)} />
                <div className={style.modalContent}>
                    <div className={style.modalHeader}>
                        <h2>Изменить время плана</h2>
                        <Icon name='FaX' onClick={() => setOpenModalTimePlan(false)} color={THEME.color.black} size={20} />
                    </div>
                    <div className={style.modalBody}>
                        <TextField
                            type="time"
                            value={newPlanTime}
                            onChange={handleTimeChange}
                            placeholder=''
                            name=''
                        />
                    </div>
                    <div className={style.modalFooter}>
                        <Button
                            onClick={handleApplyTimePlan}
                            bgColor={THEME.button.apply}
                            textColor={THEME.color.white}
                            text='Применить'
                        />
                        <Button
                            onClick={() => setOpenModalTimePlan(false)}
                            bgColor={THEME.button.cancel}
                            textColor={THEME.color.white}
                            text='Отменить'
                        />
                    </div>
                </div>
            </div>
        );
    };

    const selectModalDoc = (docStatusDelivery: IDocStatusDelivery[]) => {
        return (
            <div className={style.modal}>
                <div className={style.modalOverlay} onClick={() => setOpenModal(false)} />
                <div className={style.modalContent}>
                    <div className={style.modalHeader}>
                        <h2>Выберите документ</h2>
                        <Icon name='FaX' onClick={() => setOpenModal(false)} color={THEME.color.black} size={20} />
                    </div>
                    <div className={style.modalBody}>
                        {docStatusDelivery && docStatusDelivery.map(docDelivery =>
                            docDelivery.docs && docDelivery.docs.map(doc =>
                                <div
                                    key={doc._id} className={style.modalItem}
                                    onClick={() => setSelectIds(prev => prev.includes(doc._id) ?
                                        prev.filter(id => id !== doc._id) : [...prev, doc._id])}
                                >
                                    <input
                                        checked={selectIds.includes(doc._id)}
                                        className={style.checkbox}
                                        type='checkbox' value={doc._id}
                                    />
                                    <span className={style.date}>
                                        {
                                            new Date(doc.docDate).toISOString().split('T')[0] ===
                                                new Date().toISOString().split('T')[0] ?
                                                'Сегодня' : new Date(doc.docDate).toLocaleDateString()}
                                    </span>
                                    <span className={style.customerName}>{doc.customerId?.name}</span>
                                    <span className={style.summ}>{doc.summ}</span>
                                </div>
                            ))}
                    </div>
                    <div className={style.modalFooter}>
                        <Button
                            onClick={() => handleApply()}
                            bgColor={THEME.button.apply}
                            textColor={THEME.color.white}
                            text='Выбрать'
                        />
                        <Button
                            onClick={() => setOpenModal(false)}
                            bgColor={THEME.button.cancel}
                            textColor={THEME.color.white}
                            text='Отменить'
                        />
                    </div>
                </div>
            </div>
        )
    }

    const selectModalOrdersInfo = (docIds: string[]) => {
        return (
            <div className={style.modal}>
                <div
                    className={style.modalOverlay}
                    onClick={() => setIsInfoModalOpen(false)}
                />
                <div className={style.modalContent}>
                    <div className={style.modalHeader}>
                        <h2>Информация о заказах</h2>
                        <Icon
                            name='FaX'
                            onClick={() => setIsInfoModalOpen(false)}
                            color={THEME.color.black}
                            size={20}
                        />
                    </div>
                    <div className={style.modalBody}>
                        {/* 
                       Импорт компонента должен быть вверху файла:
                       import { DeliveryInfoOrders } from './путь/к/компоненту';
                    */}
                        <DeliveryInfoOrders docIds={docIds} />
                    </div>
                    <div className={style.modalFooter}>
                        <Button
                            onClick={() => setIsInfoModalOpen(false)}
                            bgColor={THEME.button.cancel}
                            textColor={THEME.color.white}
                            text='Закрыть'
                        />
                    </div>
                </div>
            </div>
        );
    };

    const deliveryItemsCard = (deliveryItem: DeliveryItemsDTO) => {
        const isCompleted = deliveryItem.dTimeFact !== undefined
        return (
            <div className={`${style.deliveryCard} ${isCompleted && style.completed}`}>
                <span
                    className={style.dTimePlan}
                    onClick={() => { handleChangesPlanDate(deliveryItem._id!, deliveryItem.dTimePlan) }}
                >
                    План:
                    {
                        deliveryItem.dTimePlan
                        && new Date(deliveryItem.dTimePlan).toISOString().split('T')[0]
                        && `${new Date(deliveryItem.dTimePlan)
                            .getHours()
                            .toString()
                            .padStart(2, '0')
                        }:${new Date(deliveryItem.dTimePlan)
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')}`
                    }
                </span>
                <span className={style.customerName}>{deliveryItem.customerId?.name} </span>
                <span
                    className={style.docChip + ' ' + style.address}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`geo:${deliveryItem.addressId?.gps}`)
                    }}
                >
                    {deliveryItem.addressId?.address}
                </span>

                <span
                    className={[style.docChip, style.phone].join(' ')}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${deliveryItem.customerId?.phone}`)
                    }}
                >
                    {deliveryItem.customerId?.phone}
                </span>

                <span className={style.dTimeFact} style={
                    deliveryItem.dTimeFact
                        && deliveryItem.dTimePlan < deliveryItem.dTimeFact
                        ? { color: 'red' }
                        : { color: 'blue' }
                }>
                    {
                        deliveryItem.dTimeFact && (() => {
                            const diffMs = new Date(deliveryItem.dTimePlan).getTime() - new Date(deliveryItem.dTimeFact).getTime();
                            const totalMinutes = Math.floor(diffMs / (1000 * 60)); // может быть отрицательным

                            // Если нужно только абсолютное отклонение (без знака):
                            // const totalMinutes = Math.abs(Math.floor(diffMs / (1000 * 60)));

                            const hours = Math.floor(Math.abs(totalMinutes) / 60);
                            const minutes = Math.abs(totalMinutes) % 60;

                            // Добавим знак, если важно показать "опоздание" или "раньше"
                            // Но если вы хотите просто "HH:MM" даже при опоздании — уберите знак ниже.

                            const sign = totalMinutes < 0 ? '-' : '';
                            return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        })()
                    }
                </span>
                <span className={style.entityCount}>шт.: {deliveryItem.entityCount}</span>
                <span className={style.summ}>Сум.: {deliveryItem.summ}</span>
                <span className={style.tools}>
                    <Icon
                        style={{ cursor: 'pointer' }}
                        name='FaInfo'
                        color={THEME.color.grey}
                        size={24}
                        onClick={() => handleOpenInfo(deliveryItem._id!)}
                    />
                </span>
                <span className={style.move}>
                    {deliveryEdit && <Icon
                        style={{ cursor: 'pointer' }}
                        name='FaUpLong'
                        color={THEME.color.grey}
                        size={24}
                        onClick={() => handleMoveUpItem(deliveryItem._id!)}
                    />}
                    <Icon
                        style={{ cursor: 'pointer' }}
                        name={`FaRegSquare${deliveryItem.dTimeFact ? 'Check' : ''}`}
                        color={THEME.color.black}
                        size={24}
                        onClick={() => handleCheckChange(deliveryItem._id)}
                    />
                    {deliveryEdit && <Icon
                        style={{ cursor: 'pointer' }}
                        name='FaDownLong'
                        color={THEME.color.grey}
                        size={24}
                        onClick={() => handleMoveDownItem(deliveryItem._id!)}
                    />}
                </span>
                {deliveryEdit && <span className={style.progress} >
                    <input
                        type="range"
                        min="0"
                        max="12"
                        step="1"
                        value={sliderValues[deliveryItem._id!] || 0}
                        onChange={(e) => handleProgressChange(deliveryItem._id!, Number(e.target.value))}
                        onMouseUp={() => handleProgressEnd()}
                        onTouchEnd={() => handleProgressEnd()}
                        disabled={fetcher.state !== 'idle'}
                    />
                </span>}
            </div>
        )
    }

    return (
        <div className={style.deliveryFormContainer}>
            <div className={style.header}>
                <h1>Доставка</h1>
                <Icon
                    name='FaGear'
                    color={deliveryEdit ? THEME.color.main : THEME.color.grey}
                    size={30}
                    onClick={() => setdeliveryEdit(!deliveryEdit)}
                />
                <Icon
                    name='FaMap'
                    color={THEME.color.orange}
                    size={30}
                    onClick={() => handleOpenMap()}
                />
            </div>
            <div className={style.headerRow}>
                <TextField
                    type='date'
                    name='date'
                    onChange={handleDeliveryChange}
                    placeholder='Дата доставки'
                    value={delivery.deliveryDoc?.date && new Date(delivery.deliveryDoc?.date).toISOString().split('T')[0]}
                />
                <TextField
                    type='time'
                    name='startTime'
                    onChange={handleDeliveryChange}
                    placeholder='Выезд'
                    value={new Date(delivery.deliveryDoc?.startTime).toLocaleTimeString()}
                />
            </div>
            <div className={style.headerRow}>
                <TextField
                    type='time'
                    name='timeInProgress'
                    onChange={handleDeliveryChange}
                    placeholder='От точки до точки'
                    value={delivery.deliveryDoc?.timeInProgress && new Date(delivery.deliveryDoc?.timeInProgress).toLocaleTimeString()}
                />
                <TextField
                    type='time'
                    name='unloadTime'
                    onChange={handleDeliveryChange}
                    placeholder='Время выгрузки'
                    value={delivery.deliveryDoc?.unloadTime && new Date(delivery.deliveryDoc?.unloadTime).toLocaleTimeString()}
                />
            </div>
            <div className={style.statusRow}>
                <span>Точек: {delivery.deliveryItems.length}</span>
                <span>Заказов: {delivery.deliveryDoc?.totalCountDoc}</span>
                <span>Штук: {delivery.deliveryDoc?.totalCountEntity}</span>
                <span>Сумма: {delivery.deliveryDoc?.totalSum}</span>
            </div>
            <Button
                bgColor='green'
                onClick={() => handleOpenModal()}
                textColor='white'
                text='Выбрать документы доставки'
            />
            {openModal && docStatusDelivery && selectModalDoc(docStatusDelivery)}
            {openModalTimePlan && selectModalTimePlan()}
            {isInfoModalOpen && selectModalOrdersInfo(infoModalDocIds)}
            {delivery.deliveryItems &&
                [...delivery.deliveryItems]
                    .sort((a, b) => {
                        // Сначала сортируем по чекбоксу (dTimeFact)
                        // false (undefined) - вверху, true (есть значение) - внизу
                        const aCompleted = a.dTimeFact !== undefined;
                        const bCompleted = b.dTimeFact !== undefined;

                        if (aCompleted !== bCompleted) {
                            return aCompleted ? 1 : -1;
                        }

                        // Затем сортируем по времени
                        const aDate = new Date(a.dTimePlan).getTime()
                        const bDate = new Date(b.dTimePlan).getTime()
                        return aDate - bDate
                    })
                    .map(deliveryItem => (
                        <div key={deliveryItem._id}>
                            {deliveryItemsCard(deliveryItem)}
                        </div>
                    ))}
        </div>
    )
}

