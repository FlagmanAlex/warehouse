// components/OrderList.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

import { IOrder, IOrderDetail } from '../../../types/types';
import { fetchApi } from '../../../utils';

const OrderList = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Для фильтрации по дате
    const [startDate, setStartDate] = useState<Date>(new Date('2025-01-01'));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Загрузка всех заказов
    useEffect(() => {
        fetchOrders(startDate, endDate);
    }, [startDate, endDate]);

    const fetchOrders = async (startDate: Date, endDate: Date) => {
        try {

            const orders = await fetchApi(
                `order?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
                'GET',
            );
            setOrders(orders);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches order details by order id
     * @param {string} orderId
     * @returns {Promise<IOrderDetail[]>}
     */
    const fetchOrderDetails = async (orderId: string): Promise<IOrderDetail[]> => {
        try {
            const orderDetails = await fetchApi(
                `order/${orderId}`,
                'GET',
                {}
            );
            return orderDetails || [];
        } catch (error) {
            console.error('Ошибка загрузки деталей заказа:', error);
            return [];
        }
    };

    const toggleOrderDetails = async (orderId: string) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            const details = await fetchOrderDetails(orderId);
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId ? { ...order, details } : order
                )
            );
            setExpandedOrderId(orderId);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        Alert.alert(
            'Подтвердите удаление',
            'Вы уверены, что хотите удалить этот заказ?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    onPress: async () => {
                        try {
                            await fetchApi(
                                `order/${orderId}`,
                                'DELETE',
                                {},
                            );
                        } catch (error) {
                            console.error('Ошибка удаления заказа:', error);
                        }
                    },
                },
            ]
        );
    };

    const onDateChange = (event: any, selectedDate: Date | undefined, isStart: boolean) => {
        if (selectedDate) {
            if (isStart) {
                setStartDate(selectedDate);
            } else {
                setEndDate(selectedDate);
            }
        }
        setShowStartPicker(false);
        setShowEndPicker(false);
        fetchOrders(startDate, endDate);
    };

    const showDatePicker = (isStart: boolean) => {
        if (isStart) {
            setShowStartPicker(true);
        } else {
            setShowEndPicker(true);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => toggleOrderDetails(item._id)}
            >
                <View style={styles.row}>
                    <Text style={styles.subtitle}>№{item.orderNum}</Text>
                    <Text style={styles.subtitle}>Дата: {new Date(item.orderDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.row}>
                    <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                        <Text >Тип:</Text>
                        <Text style={item.orderType === 'Расход' ? { color: '#008000' } : { color: '#ff0000' }}>{item.orderType}</Text>
                    </View>
                    <Text style={styles.subtitle}>Статус: {item.status}</Text>
                </View>
                {item.customerId ?
                    <Text style={styles.subtitle}>Клиент: {item.customerId.name}</Text>
                    : <Text> Поставщик: {item?.supplierId?.name || null}</Text>}
            </TouchableOpacity>

            {expandedOrderId === item._id && (
                <View style={styles.detailContainer}>
                    {item.details.length > 0 ? (
                        item.details.map((detail: any, index: number) => (
                            <View key={index} style={styles.detailRow}>
                                <Text>Продукт: {detail.productId?.name || 'Неизвестен'}</Text>
                                <Text>Партия: {detail.batchId?.batchNumber || 'Нет'}</Text>
                                <Text>Количество: {detail.quantity}</Text>
                                <Text>Цена: {detail.unitPrice}</Text>
                            </View>
                        ))
                    ) : (
                        <Text>Детали не найдены</Text>
                    )}
                </View>
            )}

            {/* <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() =>
                        navigation.navigate('OrderForm', {
                            mode: 'edit',
                            order: item,
                        })
                    }
                >
                    <Text style={styles.buttonText}>Редактировать</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => handleDeleteOrder(item._id)}
                >
                    <Text style={styles.buttonText}>Удалить</Text>
                </TouchableOpacity>
            </View> */}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Контроллеры выбора дат */}
            <View style={styles.datePickers}>
                <TouchableOpacity onPress={() => showDatePicker(true)}>
                    <Text>{startDate ? startDate.toLocaleDateString() : 'Выберите начальную дату'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => showDatePicker(false)}>
                    <Text>{endDate ? endDate.toLocaleDateString() : 'Выберите конечную дату'}</Text>
                </TouchableOpacity>
            </View>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, date) => onDateChange(e, date, true)}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, date) => onDateChange(e, date, false)}
                />
            )}

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    datePickers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
    },
    header: {
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        marginTop: 4,
        color: '#555',
    },
    detailContainer: {
        borderTopWidth: 1,
        borderColor: '#eee',
        paddingTop: 10,
    },
    detailRow: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    editButton: {
        backgroundColor: '#007BFF',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default OrderList;