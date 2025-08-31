// src/features/doc/components/HeaderForm.tsx
import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Button } from 'src/shared/Button';
import { Field } from '../Field';
import { DocStatus, DocStatusIn, DocStatusOut, DocType, IDoc, IDocIncoming, IDocOrder } from '@warehouse/interfaces';
import { DOC_STATUS_IN, DOC_STATUS_OUT, DOC_TYPE } from 'src/utils/statusLabels';
import { DocDto, DocIncomingDto, DocOrderDto, DocOutgoingDto, DocTransferDto } from '@warehouse/interfaces/DTO';


type HeaderFormProps = {
    doc: DocDto;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    handleDelete: () => void;
    setDoc: (doc: DocDto) => void;
    handleSave: () => void;
};

const HeaderForm = ({ doc, isEditing, setIsEditing, handleDelete, handleSave, setDoc }: HeaderFormProps) => {
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

    const handleChange = (val: DocType) => {
        (val === 'Incoming') && setDoc({ ...doc, docType: 'Incoming' } as DocIncomingDto);
        (val === 'Outgoing') && setDoc({ ...doc, docType: 'Outgoing' } as DocOutgoingDto);
        (val === 'Order') && setDoc({ ...doc, docType: 'Order' } as DocOrderDto);
        (val === 'Transfer') && setDoc({ ...doc, docType: 'Transfer' } as DocTransferDto);

    }

    const Header = () => {
        return (
            <>
                <View style={styles.card}>
                    <Field
                        label="Тип"
                        value={isEditing ? doc.docType : DOC_TYPE[doc.docType]}
                        editable={isEditing}
                        onChange={(val) => handleChange(val as DocType)}
                        options={Object.keys(DOC_TYPE).map((key) => ({
                            label: DOC_TYPE[key as DocType],
                            value: key,
                        }))}
                    />
                    {/* Для документа Incoming */}
                    {doc.docType === 'Order' && (
                    <>
                        <Field
                            label="Приоритет"
                            value={isEditing ? (doc).priority : (doc).priority}
                            editable={isEditing}
                            onChange={(val) => setDoc({ ...doc, priority: val as 'Low' | 'Medium' | 'High' })}
                            options={[
                                { label: 'Низкий', value: 'Low' },
                                { label: 'Средний', value: 'Medium' },
                                { label: 'Высокий', value: 'High' },
                            ]}
                        />
                        <Field label="Клиент" value={doc.customerId?.name} editable={false} />
                    </>
                    )}

                    {/* Для документа Outgoing */}
                    {doc.docType === 'Outgoing' && (
                        <>
                            <Field
                                label="Статус"
                                value={isEditing ? doc.status : DOC_STATUS_OUT[doc.status as DocStatusOut]}
                                editable={isEditing}
                                onChange={(val) => setDoc({ ...doc, status: val as DocStatusOut })}
                                options={Object.keys(DOC_STATUS_OUT).map((key) => ({
                                    label: DOC_STATUS_OUT[key as DocStatusOut],
                                    value: key,
                                }))}
                            />
                            <Field label="Клиент" value={doc.customerId?.name} editable={false} />
                        </>
                    )}
                    {doc.docType === 'Incoming' && (
                        <>
                            <Field
                                label="Статус"
                                value={isEditing ? doc.status : DOC_STATUS_IN[doc.status as DocStatusIn]}
                                editable={isEditing}
                                onChange={(val) => setDoc({ ...doc, status: val as DocStatusIn })}
                                options={Object.keys(DOC_STATUS_IN).map((key) => ({
                                    label: DOC_STATUS_IN[key as DocStatusIn],
                                    value: key,
                                }))}
                            />
                            <Field label="Поставщик" value={doc.supplierId?.name} editable={false} />
                        </>
                    )}
                    {doc.docType === 'Transfer' && (
                        <>
                            <Field label="Откуда" value={doc.fromWarehouseId?.name} editable={false} />
                            <Field label="Куда" value={doc.toWarehouseId?.name} editable={false} />
                        </>
                    )}
                </View>
            </>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.actions}>
                {!isEditing ? (
                    <View style={[styles.detailsRow, { flex: 1, justifyContent: 'space-between' }]}>
                        <Button onPress={() => setIsEditing(true)} bgColor="#007bff" textColor="#fff">
                            Редактировать
                        </Button>
                        <Button onPress={handleDelete} bgColor="#d32f2f" textColor="#fff">
                            Удалить
                        </Button>
                    </View>
                ) : (
                    <View style={[styles.detailsRow, { flex: 1, justifyContent: 'space-between' }]}>
                        <Button onPress={handleSave} bgColor="#28a745" textColor="#fff">
                            Сохранить
                        </Button>
                        <Button onPress={() => setIsEditing(false)} bgColor="#6c757d" textColor="#fff">
                            Отмена
                        </Button>
                    </View>
                )}
            </View>

            <Text style={styles.title}>Документ №{doc.docNum}</Text>

            <View style={styles.header}>
                <Field
                    label="Дата"
                    value={doc.docDate}
                    editable={isEditing}
                    type="date"
                    onChange={(val) => setDoc({ ...doc, docDate: new Date(val) })}
                />
                <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
                    {doc.status}
                </Text>
            </View>

            <Header />

            {isEditing && (
                <View style={styles.actions}>
                    <Button
                        bgColor="#28a745"
                        textColor="#fff"
                        onPress={() => alert('Добавить позицию')}
                    >
                        + Добавить позицию
                    </Button>
                </View>
            )}
        </View>
    );
};

export default HeaderForm;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: '600' as const,
        color: '#fff',
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    detailsRow: { flexDirection: 'row' as const, gap: 10, marginTop: 4, flexWrap: 'wrap' as const },
})