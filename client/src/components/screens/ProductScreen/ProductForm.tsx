import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchApi } from '../../../utils';
import { IProduct } from '../../../../../interfaces/IProduct';
import { ICategory } from '../../../../../interfaces/ICategory';
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

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchApi('category', 'GET');
                setCategories(response);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        loadCategories();

        if (route.params.productId) {
            fetchProduct(route.params.productId);
        }
    }, [route.params]);

    const fetchProduct = async (id: string) => {
        try {
            const response = await fetchApi(`product/${id}`, 'GET');
            setProduct(response);
            console.log(product);

        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const handleSubmit = async () => {
        if (!product.name || !product.article || !product.price) {
            Alert.alert('Ошибка', 'Заполните все поля');
            return;
        }

        try {
            const createProduct = {
                name: product.name,
                article: product.article,
                categoryId: product.categoryId._id,
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
        if (!product.name || !product.article) {
            Alert.alert('Ошибка', 'Заполните все поля');
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
        try {
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
                        onPress: async () => {
                            await fetchApi(`product/${id}`, 'DELETE', {});
                            navigation.goBack();
                        },
                    },
                ],
                { cancelable: false }
            )
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };


    return (
        <View style={styles.container}>


            {/* Выбор категории */}
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={categories.map((category) => ({ label: category.name, value: category._id }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!product.categoryId ? 'Выберите категорию' : ''}
                value={product.categoryId._id || ''}
                onChange={(item) => {
                    setProduct({ ...product, categoryId: { _id: item.value, name: item.value } });
                }}
            />

            <TextField
                placeholder="Название"
                value={product.name || ''}
                multiline
                onChangeText={(text) => setProduct({ ...product, name: text })}
            // style={styles.input}
            />
            <TextField
                placeholder="Артикул"
                value={product.article || ''}
                onChangeText={(text) => setProduct({ ...product, article: text })}
            />
            <TextField
                placeholder="Цена"
                value={product.price?.toString() || ''}
                onChangeText={(text) =>
                    setProduct({
                        ...product,
                        price: isNaN(parseFloat(text)) ? 0 : parseFloat(text),
                    })
                }
                keyboardType="numeric"
            />



            {route.params.productId ? (
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                    <Text style={styles.updateButtonText}>Обновить товар</Text>
                </TouchableOpacity>
                
            ) : (
                <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
                    <Text style={styles.createButtonText}>Создать товар</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(product._id || '')} >
                <Text style={styles.deleteButtonText}>Удалить товар</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    label: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    dropdown: {
        marginBottom: 10,
        borderColor: 'grey',
        borderWidth: 0.5,
        borderRadius: 8,
        padding: 10,
    },
    icon: {
        marginRight: 5,
    },
    labelDrop: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        borderRadius: 4,
        paddingHorizontal: 5,
        fontSize: 16,
        borderColor: 'grey',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    updateButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    createButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
    },

});

export default ProductForm;