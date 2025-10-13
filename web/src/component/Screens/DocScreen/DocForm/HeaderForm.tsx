// HeaderForm.tsx
import styles from './HeaderForm.module.css';
import { Field } from './Field';
import type { DocAndItemsDto, DocIncomingDto, DocOrderOutDto, DocOutgoingDto, DocTransferDto } from '@warehouse/interfaces/DTO';
import { EntitySelectModal } from '../../../SelectModals';
import { DocStatusInMap, DocStatusOutMap, DocTypeMap, type DocStatusInName, type DocStatusOutName, type DocTypeName } from '@warehouse/interfaces/config';
import { TextField } from '../../../../shared/TextFields';
import { StatusIcon } from '../StatusIcon';

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
                            onSelect={(item) => setDocAndItems({ doc: { ...doc, customerId: { _id: item._id, name: item.name } as any }, items })}
                            modalTitle="Выберите клиента"
                            buttonText={doc.customerId?.name || 'Выберите клиента'}
                        />

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
                        onStatusChange = {(newStatus) => setDocAndItems({ doc: { ...doc, docStatus: newStatus }, items })}
                    />}

                    {/* <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: DocStatusMap[doc.docStatus as DocStatusName].color }}
                        >
                        {DocStatusMap[doc.docStatus as DocStatusName].nameRus}
                    </span> */}
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
                    type='textarea'
                    placeholder='Комментарии'
                    value={isEditing ? doc.description : doc.description}
                    // editable={isEditing}
                    onChange={(val) => {setDocAndItems({ doc: { ...doc, description: val.target.value }, items })}}
                />

            </div>

        </div>
    );
};

export default HeaderForm;