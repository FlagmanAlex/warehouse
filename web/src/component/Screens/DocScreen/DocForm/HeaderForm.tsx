import styles from './HeaderForm.module.css';
import { Button } from '../../../../shared/Button';
import { Field } from './Field';
import type { DocStatusIn, DocStatusOut, DocType } from '@warehouse/interfaces';
import { DOC_STATUS_IN, DOC_STATUS_OUT, DOC_TYPE } from '../../../../utils/statusLabels';
import type { DocDto, DocIncomingDto, DocOrderDto, DocOutgoingDto, DocTransferDto } from '@warehouse/interfaces/DTO';

type HeaderFormProps = {
    doc: DocDto;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    handleDelete: () => void;
    setDoc: (doc: DocDto) => void;
    handleSave: () => void;
};

export const HeaderForm = ({
    doc,
    isEditing,
    setIsEditing,
    handleDelete,
    setDoc,
    handleSave,
}: HeaderFormProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Delivered':
                return '#2e7d32';
            case 'Canceled':
                return '#c62828';
            case 'Reserved':
                return '#f57c00';
            default:
                return '#1976d2';
        }
    };

    // ✅ ОПРЕДЕЛЕНИЕ ФУНКЦИИ handleChange
    const handleChange = (val: DocType) => {
        switch (val) {
            case 'Incoming':
                setDoc({ ...doc, docType: 'Incoming' } as DocIncomingDto);
                break;
            case 'Outgoing':
                setDoc({ ...doc, docType: 'Outgoing' } as DocOutgoingDto);
                break;
            case 'Order':
                setDoc({ ...doc, docType: 'Order' } as DocOrderDto);
                break;
            case 'Transfer':
                setDoc({ ...doc, docType: 'Transfer' } as DocTransferDto);
                break;
            default:
                console.warn('Неизвестный тип документа:', val);
        }
    };

    const renderTypeSpecificFields = () => {
        switch (doc.docType) {
            case 'Order':
                return (
                    <>
                        <Field
                            label="Приоритет"
                            value={isEditing ? doc.priority : doc.priority}
                            editable={isEditing}
                            onChange={(val) =>
                                setDoc({
                                    ...doc,
                                    priority: val as 'Low' | 'Medium' | 'High',
                                })
                            }
                            options={[
                                { label: 'Низкий', value: 'Low' },
                                { label: 'Средний', value: 'Medium' },
                                { label: 'Высокий', value: 'High' },
                            ]}
                        />
                        <Field label="Клиент" value={doc.customerId?.name} editable={false} />
                    </>
                );

            case 'Outgoing':
                return (
                    <>
                        <Field
                            label="Статус"
                            value={
                                isEditing ? doc.status : DOC_STATUS_OUT[doc.status as DocStatusOut]
                            }
                            editable={isEditing}
                            onChange={(val) => setDoc({ ...doc, status: val as DocStatusOut })}
                            options={Object.keys(DOC_STATUS_OUT).map((key) => ({
                                label: DOC_STATUS_OUT[key as DocStatusOut],
                                value: key,
                            }))}
                        />
                        <Field label="Клиент" value={doc.customerId?.name} editable={false} />
                    </>
                );

            case 'Incoming':
                return (
                    <>
                        <Field
                            label="Статус"
                            value={
                                isEditing ? doc.status : DOC_STATUS_IN[doc.status as DocStatusIn]
                            }
                            editable={isEditing}
                            onChange={(val) => setDoc({ ...doc, status: val as DocStatusIn })}
                            options={Object.keys(DOC_STATUS_IN).map((key) => ({
                                label: DOC_STATUS_IN[key as DocStatusIn],
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
            {/* Кнопки управления */}
            <div className={styles.actions}>
                {!isEditing ? (
                    <div className={styles.buttonGroup}>
                        <Button
                            onClick={() => setIsEditing(true)}
                            bgColor="#007bff"
                            textColor="#fff"
                            text="Редактировать"
                        />
                        <Button
                            onClick={handleDelete}
                            bgColor="#d32f2f"
                            textColor="#fff"
                            text="Удалить"
                        />
                    </div>
                ) : (
                    <div className={styles.buttonGroup}>
                        <Button
                            onClick={handleSave}
                            bgColor="#28a745"
                            textColor="#fff"
                            text="Сохранить"
                        />
                        <Button
                            onClick={() => setIsEditing(false)}
                            bgColor="#6c757d"
                            textColor="#fff"
                            text="Отмена"
                        />
                    </div>
                )}
            </div>

            {/* Заголовок */}
            <h2 className={styles.title}>Документ №{doc.docNum}</h2>

            {/* Шапка: дата + статус */}
            <div className={styles.header}>
                <Field
                    label="Дата"
                    value={doc.docDate}
                    editable={isEditing}
                    type="date"
                    onChange={(val) => setDoc({ ...doc, docDate: new Date(val) })}
                />
                <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(doc.status) }}
                >
                    {doc.status}
                </span>
            </div>

            {/* Карточка с полями */}
            <div className={styles.card}>
                {/* ✅ ВЫЗОВ handleChange — ЗДЕСЬ! */}
                <Field
                    label="Тип"
                    value={isEditing ? doc.docType : DOC_TYPE[doc.docType]}
                    editable={isEditing}
                    onChange={(val) => handleChange(val as DocType)}  // ← ЭТОТ ВЫЗОВ ИСПОЛЬЗУЕТ handleChange!
                    options={Object.keys(DOC_TYPE).map((key) => ({
                        label: DOC_TYPE[key as DocType],
                        value: key,
                    }))}
                />
                {renderTypeSpecificFields()}
            </div>

            {/* Кнопка "Добавить позицию" (только в режиме редактирования) */}
            {isEditing && (
                <div className={styles.actions}>
                    <Button
                        bgColor="#28a745"
                        textColor="#fff"
                        onClick={() => alert('Добавить позицию')}
                        text="Добавить позицию"
                    />
                </div>
            )}
        </div>
    );
};

export default HeaderForm;