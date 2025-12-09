import { useFetcher, useLoaderData } from 'react-router-dom'
import style from './DeliveryForm.module.css'
import type { DeliveryDto, DeliveryItemsDTO, DocOrderOutDto } from '@warehouse/interfaces/DTO'
import { useEffect, useState } from 'react'
import { TextField } from '../../../shared/TextFields'
import { Button } from '../../../shared/Button'
import { Icon } from '../../../shared/Icon'
import { THEME } from '@warehouse/interfaces/config'

interface IDocStatusDelivery {
    customerId: string;
    customerName: string;
    docs: DocOrderOutDto[]
}
export const DeliveryForm = () => {

    const { delivery: { deliveryDoc, deliveryItems }, docStatusDelivery } = useLoaderData()
    const [delivery, setDelivery] = useState<DeliveryDto>({ deliveryDoc, deliveryItems })
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [openModalTimePlan, setOpenModalTimePlan] = useState<boolean>(false)
    const [selectIds, setSelectIds] = useState<string[]>([])
    const [newPlanTime, setNewPlanTime] = useState<string>('00:00')
    const fetcher = useFetcher()

    useEffect(() => {
        if (fetcher.data?.success && fetcher.data?.data) {
            if (fetcher.formMethod !== 'POST') return
            setDelivery(fetcher.data.data)
            setSelectIds([])
        }
    }, [fetcher.data])

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
        console.log(delivery.deliveryDoc);

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

        console.log(updatedDeliveryItems);
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
        fetcher.submit(formData, {
            action: `/delivery-planning/${delivery.deliveryDoc._id}`,
            method: 'POST'
        })
    }

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
    }; const selectModalDoc = (docStatusDelivery: IDocStatusDelivery[]) => {
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
    const deliveryItemsCard = (deliveryItem: DeliveryItemsDTO) => {
        console.log('dTimePlan', deliveryItem.dTimePlan, 'dTimeFact', deliveryItem.dTimeFact)
        return (
            <div className={style.deliveryCard}>
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
                <span className={style.customerName}>{deliveryItem.customerId?.name}</span>
                <a className={style.address} href={`geo:${deliveryItem.addressId?.gps}`} onClick={(e) => e.stopPropagation()}>
                    <span className={style.docChip}>
                        {deliveryItem.addressId?.address}
                    </span>
                </a>
                <a className={style.phone} href={`tel:${deliveryItem.addressId?.gps}`} onClick={(e) => e.stopPropagation()}>
                    <span className={style.docChip}>{deliveryItem.customerId?.phone}</span>
                </a>

                <span className={style.dTimeFact} style={
                    deliveryItem.dTimeFact
                        && deliveryItem.dTimePlan < deliveryItem.dTimeFact
                        ? { color: 'red' }
                        : { color: 'blue' }
                }>
                    {
                        deliveryItem.dTimeFact
                        && new Date(deliveryItem.dTimeFact).toISOString().split('T')[0]
                        && `${new Date(new Date(deliveryItem.dTimePlan).getTime()
                            - new Date(deliveryItem.dTimeFact).getTime())
                            .toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                        // .padStart(2, '0')
                        }`
                    }
                </span>
                <span className={style.entityCount}>шт.: {deliveryItem.entityCount}</span>
                <span className={style.summ}>Сум.: {deliveryItem.summ}</span>
                <span className={style.tools}>
                    <Icon style={{ cursor: 'pointer' }} name='FaInfo' color={THEME.color.grey} size={24} />
                    <Icon
                        style={{ cursor: 'pointer' }}
                        name={`FaRegSquare${deliveryItem.dTimeFact ? 'Check' : ''}`}
                        color={THEME.color.black}
                        size={24}
                        onClick={() => handleCheckChange(deliveryItem._id)}
                    />
                </span>
            </div>
        )
    }

    return (
        <div className={style.deliveryFormContainer}>
            <div className={style.header}>
                <h1>Доставка</h1>
                <Icon
                    name='FaMap'
                    color={THEME.color.orange}
                    size={20}
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
                onClick={() => setOpenModal(true)}
                textColor='white'
                text='Выбрать документы доставки'
            />
            {openModal && docStatusDelivery && selectModalDoc(docStatusDelivery)}
            {openModalTimePlan && selectModalTimePlan()}
            {delivery.deliveryItems &&
                [...delivery.deliveryItems]
                    .sort((a, b) => {
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

