import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchApi } from '../../../utils';
import { IProduct, ICategory } from '@warehouse/interfaces';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductStackParamList } from '../../../types/types';
import { Dropdown } from 'react-native-element-dropdown';
import { TextField } from '../../../shared/TextField';

const ProductForm = ({ route }: { route: { params: { productId?: string } } }) => {
    const navigation = useNavigation<NativeStackNavigationProp<ProductStackParamList>>();
    const [product, setProduct] = useState<Partial<IProduct>>({
        name: '',
        article: '',
        categoryId: '',
        unitOfMeasurement: 'шт',
        price: 0,
        isArchived: false,
    });

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchApi('category', 'GET');
                setCategories(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                Alert.alert('Ошибка', 'Не удалось загрузить категории');
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();

        if (route.params?.productId) {
            fetchProduct(route.params.productId);
        } else {
            // Сброс при создании нового товара
            setProduct({
                name: '',
                article: '',
                categoryId: '',
                unitOfMeasurement: 'шт',
                price: 0,
                isArchived: false,
            });
        }
    }, [route.params?.productId]);

    const fetchProduct = async (id: string) => {
        try {
            const response = await fetchApi(`product/${id}`, 'GET');
            // Нормализуем categoryId: если объект — берём _id, иначе оставляем как есть
            const categoryId = response.categoryId?._id || response.categoryId || '';
            setProduct({
                ...response,
                categoryId,
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            Alert.alert('Ошибка', 'Не удалось загрузить товар');
            navigation.goBack();
        }
    };

    const handleSubmit = async () => {
        if (!product.name || !product.article || product.price == null || product.price < 0) {
            Alert.alert('Ошибка', 'Заполните все обязательные поля');
            return;
        }

        try {
            const createProduct = {
                name: product.name,
                article: product.article,
                categoryId: product.categoryId,
                unitOfMeasurement: 'шт',
                price: product.price,
                isArchived: false,
            };
            await fetchApi('product', 'POST', createProduct);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось создать товар');
        }
    };

    const handleUpdate = async () => {
        if (!product._id || !product.name || !product.article) {
            Alert.alert('Ошибка', 'Заполните все обязательные поля');
            return;
        }

        try {
            await fetchApi(`product/${product._id}`, 'PUT', product as Omit<IProduct, '_id'>);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось обновить товар');
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) return;

        Alert.alert(
            'Подтвердите удаление',
            'Вы уверены, что хотите удалить этот товар?',
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
                {
                    text: 'Удалить',
                    onPress: () => {
                        (async () => {
                            try {
                                await fetchApi(`product/${id}`, 'DELETE');
                                navigation.goBack();
                            } catch (error) {
                                console.error('Error deleting product:', error);
                                Alert.alert('Ошибка', 'Не удалось удалить товар');
                            }
                        })();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // Преобразуем категории для Dropdown
    const dropdownData = categories.map((category) => ({
        label: category.name,
        value: category._id,
    }));

    return (
        <View style={styles.container}>
            {/* Выбор категории */}
            <Text style={styles.label}>Категория</Text>
            {loadingCategories ? (
                <Text style={styles.placeholderStyle}>Загрузка категорий...</Text>
            ) : (
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dropdownData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Выберите категорию"
                    value={product.categoryId || ''}
                    onChange={(item) => {
                        setProduct({ ...product, categoryId: item.value });
                    }}
                />
            )}

            {/* Название */}
            <Text style={styles.label}>Название</Text>
            <TextField
                placeholder="Введите название товара"
                value={product.name || ''}
                multiline
                onChangeText={(text) => setProduct({ ...product, name: text })}
            />

            {/* Артикул */}
            <Text style={styles.label}>Артикул</Text>
            <TextField
                placeholder="Введите артикул"
                value={product.article || ''}
                onChangeText={(text) => setProduct({ ...product, article: text })}
            />

            {/* Цена */}
            <Text style={styles.label}>Цена</Text>
            <TextField
                placeholder="Введите цену"
                value={product.price?.toString() || ''}
                onChangeText={(text) =>
                    setProduct({
                        ...product,
                        price: isNaN(parseFloat(text)) ? 0 : parseFloat(text),
                    })
                }
                keyboardType="numeric"
            />

            {/* Кнопки */}
            {route.params?.productId ? (
                <>
                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                        <Text style={styles.updateButtonText}>Обновить товар</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(product._id || '')}
                    >
                        <Text style={styles.deleteButtonText}>Удалить товар</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
                    <Text style={styles.createButtonText}>Создать товар</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
    },
    dropdown: {
        marginBottom: 16,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    updateButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#28a745',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProductForm;