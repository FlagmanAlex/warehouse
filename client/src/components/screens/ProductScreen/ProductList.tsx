import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';

import {
    ProductStackParamList,
} from '../../../types/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchApi } from '../../../utils';
import { TextField } from '../../../shared/TextField';
import { THEME } from '../../../Default';
import { IconButton } from 'react-native-paper';
import { ResponseProductDto } from '@warehouse/interfaces/DTO';

const ProductList = () => {
    const [products, setProducts] = useState<ResponseProductDto[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ResponseProductDto[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
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
            setFilteredProducts(data); // инициализируем отфильтрованный список
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredProducts(products);
            return;
        }

        const filtered = products.filter((item) =>
            item.name.toLowerCase().includes(text.toLowerCase()) ||
            item.article.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    const handleEdit = (productId: string) => {
        navigation.navigate('ProductForm', { productId });
    };

    const handleCreate = () => {
        navigation.navigate('ProductForm', { productId: '' });
    };

    return (
        <View style={styles.container}>

            <IconButton
                style={styles.addButton}
                iconColor='#fff'
                icon="plus"
                containerColor={THEME.button.add}
                size={30}
                onPress={handleCreate}
            />

            <TextField
                // style={styles.searchInput}
                placeholder="Поиск по названию или артикулу"
                value={searchQuery}
                onChangeText={handleSearch}
            />




            <FlatList
                data={filteredProducts}
                keyExtractor={item => item._id!.toString()}
                renderItem={({ item }) => (
                    <View style={styles.productItem}>
                        <TouchableOpacity
                            onPress={() => handleEdit(item._id!)}
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
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    addButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        zIndex: 1,
    },
});

export default ProductList;