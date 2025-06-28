// ProductList.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Button,
    StyleSheet,
} from 'react-native';
import { Product, ProductStackParamList } from '../../../types/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchApi } from '../../../utils';


const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<ProductStackParamList>>();

    useEffect(() => {
        loadProducts();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadProducts();
        }, [])
    );

    const loadProducts = async () => {
        try {
            const data = await fetchApi(`product`, 'GET', {});
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleEdit = (productId: string) => {
        navigation.navigate('ProductForm', { productId });
    };

    const handleCreate = () => {
        navigation.navigate('ProductForm', { productId: '' });
    };

    return (
        <View style={styles.container}>
            <Button title="Добавить товар" onPress={handleCreate} />

            <FlatList
                data={products}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.productItem}>
                        <TouchableOpacity
                            // style={[styles.actionButton, styles.editButton]}
                            onPress={() => handleEdit(item._id)}
                        >
                            <Text style={styles.productName}>{`${item.categoryId.name}, ${item.name}`}</Text>
                            <Text>Артикул: {item.article}</Text>
                            <Text>Цена: {item.price} руб.</Text>

                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    productItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
});

export default ProductList;