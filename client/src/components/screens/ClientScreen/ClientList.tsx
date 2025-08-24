import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Card, Title, TextInput as PaperInput, Button, IconButton, Text } from 'react-native-paper';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ClientStackParamList } from '../../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApi } from '../../../utils';
import { ICustomer } from '@interfaces';


type ClientListNavigationProp = StackNavigationProp<ClientStackParamList, 'ClientList'>;



const ClientList = () => {
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const navigation = useNavigation<ClientListNavigationProp>();
    const route = useRoute<RouteProp<ClientStackParamList, 'ClientList'>>();

    // Используем useMemo вместо useEffect
    const filteredCustomers = useMemo(() => {
        if (customers.length === 0) return [];
        return customers.filter((customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customers, searchQuery]);

    useEffect(() => {
        fetchClients();
    }, []);


    useFocusEffect(
        React.useCallback(() => {
            fetchClients();
            navigation.setParams({ refresh: undefined });
        }, [route.params?.refresh])
    );

    const fetchClients = async () => {
        try {
            const customers = await fetchApi('customer', 'GET', {});
            setCustomers(customers);
        } catch (error) {
            console.error('Ошибка загрузки клиентов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Поиск */}
            <PaperInput
                label="Поиск по имени"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
            />

            {/* Список клиентов */}
            <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item._id!.toString()}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchClients} />}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('ClientForm', { customerId: item._id! })}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant='titleLarge'>{item.name}</Text>
                                <Text variant='titleMedium'>{item.phone}</Text>
                                <Text variant='bodySmall'>{item.address}</Text>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                )}
            />

            {/* Кнопка создания нового клиента */}
            <IconButton
                icon="plus"
                size={30}
                iconColor="#fff"
                style={styles.floatingButton}
                onPress={() => navigation.navigate('ClientForm', { customerId: '' })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        marginBottom: 10,
    },
    card: {
        marginVertical: 8,
        elevation: 3,
        borderRadius: 8,
    },
    cardActions: {
        justifyContent: 'space-between',
        marginTop: 10,
    },
    floatingButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#28a745',
        zIndex: 1,
    },
});

export default ClientList;