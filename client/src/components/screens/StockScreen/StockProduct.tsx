import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
} from 'react-native';

type MovementItem = {
    _id: string;
    transactionType: 'in' | 'out';
    orderId: {
        _id: string
        orderDate: string
        orderNum: string
    }
    productId: {
        _id: string;
        name: string;
        article: string;
    };
    warehouseId: {
        _id: string;
        name: string;
    };
    batchId: {
        _id: string;
        quantityReceived: number;
        purchasePrice: number;
        expirationDate: string;
        receiptDate: string;
        unitOfMeasure: string;
        status: string;
    };
    previousQuantity: number;
    changeQuantity: number;
    newQuantity: number;
    userId: string;
    transactionDate: string;
};

type RouteParams = {
    productId: string;
};

const StockProduct = ({ route }: any) => {
    const { productId } = route.params as RouteParams;

    const host = `http://192.168.50.100`;
    const port = `5050`;
    const server = `${host}:${port}`;
    const url = `${server}/api/transaction/${productId}`;

    const [movements, setMovements] = useState<MovementItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                // Сортируем массив по дате (по возрастанию)
                const sortedData = data.sort((a: MovementItem, b: MovementItem) =>
                    new Date(a.orderId.orderDate).getTime() - new Date(b.orderId.orderDate).getTime()
                );

                setMovements(sortedData);
            } catch (error) {
                console.log('Ошибка при загрузке движений', error);
            }
        };

        fetchData();
    }, [productId]);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={[styles.cell, styles.headerTitle, { width: 90 }]}>Дата</Text>
                <Text style={[styles.cell, styles.headerTitle, { width: 80 }]}>Номер</Text>
                <Text style={[styles.cell, styles.headerTitle, { width: 50 }]}>Тип</Text>
                <Text style={[styles.cell, styles.headerTitle, { width: 60 }]}>Кол.</Text>
                <Text style={[styles.cell, styles.headerTitle, { width: 60 }]}>Цена</Text>
            </View>
            <FlatList
                data={movements}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    return (
                        <View style={styles.row}>
                            <Text style={[styles.cell, styles.dateText]}>
                                {new Date(item.orderId.orderDate).toLocaleDateString()}
                            </Text>
                            <Text style={styles.cell}> {item.orderId.orderNum} </Text>
                            <Text style={[styles.cell, item.transactionType === 'in' ? styles.income : styles.expense]}>
                                {item.transactionType === 'in' ? 'Приход' : 'Расход'}
                            </Text>
                            <Text style={[styles.cell, styles.value]}>  {Math.abs(item.changeQuantity)}   </Text>
                            <Text style={[styles.cell, styles.value]}>{item.batchId.purchasePrice.toFixed(0)}</Text>
                        </View>
                    )
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>Нет данных о движениях</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    movementItem: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 6,
        backgroundColor: '#f9f9f9',
    },
    row: {
        flexDirection: 'row',
        // justifyContent: 'space-around',
        // alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        marginRight: 8,
        color: '#333',
    },
    value: {
        color: '#333',
    },
    dateText: {
        fontSize: 14,
        color: '#888',
        // marginBottom: 8,
    },
    income: {
        color: 'green',
    },
    expense: {
        color: 'red',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    cell: {
        // flex: 1,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default StockProduct