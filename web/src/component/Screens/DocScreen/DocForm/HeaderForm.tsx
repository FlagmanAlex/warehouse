// HeaderForm.tsx
import styles from './HeaderForm.module.css';
import { Field } from './Field';
import type { DocAndItemsDto, DocIncomingDto, DocOrderOutDto, DocOutgoingDto, DocTransferDto } from '@warehouse/interfaces/DTO';
import { EntitySelectModal } from '../../../SelectModals';
import { DocStatusInMap, DocStatusOutMap, DocTypeMap, type DocStatusInName, type DocStatusOutName, type DocTypeName } from '@warehouse/config';
import { TextField } from '../../../../shared/TextFields';
import { StatusIcon } from '../StatusIcon';
import type { IAddress, ICustomer } from '@warehouse/interfaces';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../api/fetchApi';

type HeaderFormProps = {
    docAndItems: DocAndItemsDto;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    setDocAndItems: (docAndItems: DocAndItemsDto) => void;
    cancel: () => void;
};

export const HeaderForm = ({
    docAndItems: { doc, items },
    isEditing,
    setDocAndItems,
}: HeaderFormProps) => {


    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<IAddress | undefined>(undefined);

    const handleUpdateCustomer = async (customer: ICustomer) => {
        const response: IAddress[] = await fetchApi(`address/${customer._id}`, 'GET');
        setAddresses(response);
        const addressMain = response.find(addr => addr.main === true) || response[0];
        setSelectedAddress(addressMain);
        if (doc.docType === 'OrderOut' || doc.docType === 'Outgoing') {
            setDocAndItems({
                doc: {
                    ...doc, 
                    customerId: { _id: customer._id, name: customer.name } as any,
                    addressId: addressMain
                },
                items
            })
        }
    };

    useEffect(() => {
        const fetchAddress = async () => {
            if (doc.docType === 'OrderOut' || doc.docType === 'Outgoing') {
                if (doc.customerId) {
                    const response: IAddress[] = await fetchApi(`address/${doc.customerId._id}`, 'GET');
                    setAddresses(response);
                    const selectAddress = response.find(addr => addr._id === doc.addressId);
                    setSelectedAddress(selectAddress);
                } else {
                    setAddresses([]);
                }
            }
        }
        fetchAddress();
    }, [])


    // Обработчик выбора клиента

    const handleChange = (val: DocTypeName) => {
        switch (val) {
            case 'Incoming':
                setDocAndItems({ doc: { ...doc, docType: 'Incoming' } as DocIncomingDto, items });
                break;
            case 'Outgoing':
                setDocAndItems({ doc: { ...doc, docType: 'Outgoing' } as DocOutgoingDto, items });
                break;
            case 'OrderOut':
                setDocAndItems({ doc: { ...doc, docType: 'OrderOut' } as DocOrderOutDto, items });
                break;
            case 'Transfer':
                setDocAndItems({ doc: { ...doc, docType: 'Transfer' } as DocTransferDto, items });
                break;
            default:
                console.warn('Неизвестный тип документа:', val);
        }
    };


    const renderTypeSpecificFields = () => {
        switch (doc.docType) {
            case 'OrderOut':
                return (
                    <>
                        <Field
                            label="Приоритет"
                            value={isEditing ? doc.priority : doc.priority}
                            editable={isEditing}
                            onChange={(val) =>
                                setDocAndItems({
                                    doc: {
                                        ...doc,
                                        priority: val as 'Low' | 'Medium' | 'High',
                                    },
                                    items,
                                })
                            }
                            options={[
                                { label: 'Низкий', value: 'Low' },
                                { label: 'Средний', value: 'Medium' },
                                { label: 'Высокий', value: 'High' },
                            ]}
                        />
                        <EntitySelectModal
                            endpoint="customer"
                            selectedItem={doc.customerId?._id ? doc.customerId : null}
                            onSelect={(item) => {
                                handleUpdateCustomer(item as ICustomer);
                            }}
                            modalTitle="Выберите клиента"
                            buttonText={doc.customerId?.name || 'Выберите клиента'}
                        />

                        {/* Селект адреса доставки */}
                        <select
                            className={styles.addressSelect}
                            disabled={!isEditing}
                            value={selectedAddress?._id || ''}
                            onChange={
                                (e) => {
                                    const addr = addresses.find(addr => String(addr._id) === e.target.value);
                                    if (!addr) return;
                                    setDocAndItems({ doc: { ...doc, addressId: addr }, items });
                                    setSelectedAddress(addr);
                                }
                            }>
                            {/* <option value="">Адрес не выбран</option> */}
                            {addresses && addresses.map((item) => (
                                <option key={item._id} value={String(item._id)}>
                                    {item.address}
                                </option>
                            ))}
                        </select>
                    </>
                );

            case 'Outgoing':
                return (
                    <>
                        <Field
                            label="Статус"
                            value={
                                isEditing ? doc.docStatus : DocStatusOutMap[doc.docStatus as DocStatusOutName].nameRus
                            }
                            editable={isEditing}
                            onChange={(val) => setDocAndItems({ doc: { ...doc, docStatus: val as DocStatusOutName }, items })}
                            options={Object.keys(DocStatusOutMap).map((key) => ({
                                label: DocStatusOutMap[key as DocStatusOutName].name,
                                value: key,
                            }))}
                        />
                        <EntitySelectModal
                            endpoint="customer"
                            selectedItem={doc.customerId?._id ? doc.customerId : null}
                            onSelect={(item) => setDocAndItems({ doc: { ...doc, customerId: { _id: item._id, name: item.name } as any }, items })}
                            modalTitle="Выберите клиента"
                            buttonText={doc.customerId?.name || 'Выберите клиента'}
                        />
                    </>
                );

            case 'Incoming':
                return (
                    <>
                        <Field
                            label="Статус"
                            value={
                                isEditing ? doc.docStatus : DocStatusInMap[doc.docStatus as DocStatusInName].nameRus
                            }
                            editable={isEditing}
                            onChange={(val) => setDocAndItems({ doc: { ...doc, docStatus: val as DocStatusInName }, items })}
                            options={Object.keys(DocStatusInMap).map((key) => ({
                                label: DocStatusInMap[key as DocStatusInName].name,
                                value: key,
                            }))}
                        />
                        <Field label="Поставщик" value={doc.supplierId?.name} editable={false} />
                    </>
                );

            case 'Transfer':
                return (
                    <>
                        <Field label="Откуда" value={doc.fromWarehouseId?.name} editable={false} />
                        <Field label="Куда" value={doc.toWarehouseId?.name} editable={false} />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>

            {/* Заголовок */}
            <div className={styles.card}>
                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>Документ №{doc.docNum}</h2>
                    {doc._id && <StatusIcon
                        docType={doc.docType}
                        status={doc.docStatus}
                        docId={doc._id}
                        onStatusChange={(newStatus) => setDocAndItems({ doc: { ...doc, docStatus: newStatus }, items })}
                    />}
                </div>

                {/* Шапка: дата + статус */}
                <div className={styles.header}>
                    <Field
                        label="Дата"
                        value={new Date(doc.docDate)}
                        editable={isEditing}
                        type="date"
                        onChange={(val) => setDocAndItems({ doc: { ...doc, docDate: new Date(val) }, items })}
                    />
                </div>
                {/* Карточка с полями */}
                {doc.docType !== 'OrderOut' && (
                    <Field
                        label="Тип"
                        value={isEditing ? doc.docType : DocTypeMap[doc.docType].nameRus}
                        editable={isEditing}
                        onChange={(val) => handleChange(val as DocTypeName)}
                        options={Object.keys(DocTypeMap).map((key) => ({
                            label: DocTypeMap[key as DocTypeName].nameRus,
                            value: key,
                        }))}
                    />
                )}
                {renderTypeSpecificFields()}
                <TextField
                    name="description"
                    type='text'
                    placeholder='Комментарии'
                    value={isEditing ? doc.description : doc.description}
                    // editable={isEditing}
                    onChange={(val) => { setDocAndItems({ doc: { ...doc, description: val.target.value }, items }) }}
                />

            </div>

        </div>
    );
};

export default HeaderForm;