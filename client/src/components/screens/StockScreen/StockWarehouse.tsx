import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchApi } from '../../../utils';
import { RootStackParamList, StockStackParamList } from '../../../types/types';

type ProductBatch = {
    _id: string;
    warehouseId: {
        _id: string;
        name: string;
    };
    batchId: {
        _id: string;
        productId: string;
        supplierId: string;
        quantityReceived: number;
        purchasePrice: number;
        expirationDate: string;
        receiptDate: string;
        unitOfMeasure: string;
        status: string;
        warehouseId: string;
    };
    lastUpdate: string;
    productId: {
        _id: string;
        name: string;
        article: string;
        categoryId: {
            _id: string;
            name: string;
        };
        unitOfMeasurement: string;
        price: number;
        isArchived: boolean;
        createdBy: string;
        lastUpdateBy: string;
        supplierId: string;
    };
    quantityAvailable: number;
};

type GroupedProduct = {
    id: string;
    name: string;
    totalQuantity: number;
    batches: ProductBatch[];
};

export type ProductScreenNavigationProp = StackNavigationProp<
    StockStackParamList,
    'По товару'
>;


const StockWarehouse = () => {

    const [db, setDb] = useState<ProductBatch[]>([]);
    const [filteredData, setFilteredData] = useState<ProductBatch[]>([]);
    const [productNameFilter, setProductNameFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expirationFilter, setExpirationFilter] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const navigation = useNavigation<ProductScreenNavigationProp>();

    // Загрузка данных
    const fetchData = async () => {
        try {
            const response = await fetchApi(
                `inventory/warehousenotnull/685415c8afe93552b9aec620`,
                'GET',
                {}
            );

            setDb(response);
            setFilteredData(response); // обновляем фильтрованные данные
        } catch (error) {
            console.log('Ошибка при загрузке данных', error);
        }
    };

    // Обработка обновления при свайпе
    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        applyFilters()
        setIsRefreshing(false);
    };

    // Группировка данных по продуктам
    const getGroupedProducts = (data: ProductBatch[]): GroupedProduct[] => {
        return Object.values(
            data.reduce((acc, item) => {
                if (!acc[item.productId._id]) {
                    acc[item.productId._id] = {
                        id: item.productId._id,
                        name: item.productId.name,
                        totalQuantity: 0,
                        batches: [],
                    };
                }

                acc[item.productId._id].batches.push(item);
                acc[item.productId._id].totalQuantity += item.quantityAvailable;

                return acc;
            }, {} as Record<string, GroupedProduct>)
        );
    };

    const products = getGroupedProducts(filteredData);

    // Состояние для хранения открытых продуктов
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    // Применяем фильтры
    const applyFilters = () => {
        let filtered = db;

        // Фильтр по названию продукта
        if (productNameFilter.trim()) {
            filtered = filtered.filter((item) =>
                item.productId.name.toLowerCase().includes(productNameFilter.toLowerCase())
            );
        }

        // Фильтр по статусу партии
        if (statusFilter !== 'all') {
            filtered = filtered.filter((item) => item.batchId.status === statusFilter);
        }

        // Фильтр по сроку годности
        const today = new Date();
        if (expirationFilter === 'soon') {
            filtered = filtered.filter((item) => {
                const expDate = new Date(item.batchId.expirationDate);
                const daysLeft = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysLeft > 0 && daysLeft <= 30; // ближайшие 30 дней
            });
        } else if (expirationFilter === 'expired') {
            filtered = filtered.filter((item) => {
                const expDate = new Date(item.batchId.expirationDate);
                return expDate < today;
            });
        }

        setFilteredData(filtered);
    };

    // Вызываем applyFilters при изменении любого фильтра
    useEffect(() => {
        applyFilters();
    }, [productNameFilter, statusFilter, expirationFilter]);

    // Компонент отдельной группы (продукт + партии)
    const renderProductGroup = ({ item }: { item: GroupedProduct }) => {
        const quantity = item.totalQuantity;
        const batch = item.batches.sort((a, b) =>
            new Date(b.batchId.receiptDate).getTime() -
            new Date(a.batchId.receiptDate).getTime())[0];
        const price = batch?.batchId.purchasePrice.toFixed(0) || 0;
        const sum = item.batches.reduce((acc, batch) => acc +
            (batch.batchId.purchasePrice * batch.quantityAvailable), 0).toFixed(0);
        return (
            <View key={item.id} style={styles.productGroup}>
                <TouchableOpacity
                    style={styles.productHeader}
                    onPress={() => toggleExpand(item.id)}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{`${item.batches[0].productId.categoryId.name}, ${item.name}`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.totalQuantity}>Остаток: {quantity} </Text>
                            <Text style={styles.totalQuantity}>Цена: {price} </Text>
                            <Text style={styles.totalQuantity}>Сумма: {sum} </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.movementButton}
                        onPress={() => navigation.navigate('По товару', { productId: item.id })}
                    >
                        <Text style={styles.movementButtonText}>Движение</Text>
                    </TouchableOpacity>
                    <Text style={styles.arrow}>
                        {expandedIds.has(item.id) ? '▼' : '▶'}
                    </Text>
                </TouchableOpacity>
                {/* Показываем партии только если развернут */}
                {expandedIds.has(item.id) && (
                    <View style={styles.batchList}>
                        {item.batches.map((batch) => (
                            <View key={batch._id} style={styles.batchItem}>
                                <Text style={styles.batchText}>Артикул: {batch.productId.article}</Text>
                                <Text style={styles.batchText}>Название: {batch.productId.name}</Text>
                                <Text style={styles.batchText}>Количество на складе: {batch.quantityAvailable}</Text>
                                <Text style={styles.batchText}>Дата поступления: {new Date(batch.batchId.receiptDate).toLocaleDateString()}</Text>
                                <Text style={styles.batchText}>Срок годности: {new Date(batch.batchId.expirationDate).toLocaleDateString()}</Text>
                                <Text style={styles.batchText}>Ед. изм.: {batch.batchId.unitOfMeasure}</Text>
                                <Text style={styles.batchText}>Статус: {batch.batchId.status}</Text>
                                <Text style={styles.batchText}>Цена закупки: {batch.batchId.purchasePrice.toFixed(0)} руб.</Text>
                                <Text style={styles.batchText}>Склад: {batch.warehouseId.name}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            {/* Фильтры */}
            <View style={styles.filtersContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Поиск по названию"
                    value={productNameFilter}
                    onChangeText={(text) => setProductNameFilter(text)}
                />

                {/* <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={statusFilter}
                        onValueChange={(itemValue) => setStatusFilter(itemValue)}
                    >
                        <Picker.Item label="Все статусы" value="all" />
                        <Picker.Item label="Активный" value="активный" />
                        <Picker.Item label="Неактивный" value="неактивный" />
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={expirationFilter}
                        onValueChange={(itemValue) => setExpirationFilter(itemValue)}
                    >
                        <Picker.Item label="Все партии" value="all" />
                        <Picker.Item label="Ближайшие к истечению" value="soon" />
                        <Picker.Item label="Истёкшие" value="expired" />
                    </Picker>
                </View> */}
            </View>

            {/* Отчет */}
            <FlatList
                data={products}
                renderItem={renderProductGroup}
                keyExtractor={(item) => item.id}
                refreshing={isRefreshing}
                onRefresh={onRefresh}
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
    filtersContainer: {
        flexDirection: 'column',
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    pickerContainer: {
        height: 40,
        width: '100%',
        marginBottom: 8,
    },
    productGroup: {
        marginBottom: 16,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    arrow: {
        fontSize: 16,
    },
    totalQuantity: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
    },
    batchList: {
        marginTop: 8,
        paddingLeft: 16,
    },
    batchItem: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
    },
    batchText: {
        fontSize: 14,
        color: '#333',
    },
    movementButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    movementButtonText: {
        color: '#fff',
        fontSize: 12,
    },
});

export default StockWarehouse;