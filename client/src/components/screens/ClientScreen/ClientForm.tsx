import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApi } from '../../../utils';
import { Client, ClientStackParamList, RootStackParamList } from '../../../types/types';


type ClientFormScreenNavigationProp = StackNavigationProp<ClientStackParamList, 'ClientList'>;
type ClientFormScreenRouteProp = RouteProp<ClientStackParamList, 'ClientForm'>;

interface FormData {
    name: string;
    phone: string;
    address: string;
    percent: string;
    accountManager: string;
}

const ClientForm = ({ route, navigation }: { route: ClientFormScreenRouteProp; navigation: ClientFormScreenNavigationProp }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        address: '',
        percent: '',
        accountManager: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (route.params?.clientId) {
            setIsEditing(true);
            fetchClient(route.params.clientId);
        }
    }, []);

    const fetchClient = async (id: string) => {
        try {
            const client = await fetchApi(`customer/${id}`, 'GET', {});
            setFormData({
                name: client.name,
                phone: client.phone,
                address: client.address,
                percent: client.percent.toString(),
                accountManager: client.accountManager,
            });
        } catch (error) {
            console.error('Ошибка получения клиента:', error);
            Alert.alert('Ошибка', 'Не удалось получить данные клиента');
        }
    };

    const handleSubmit = async () => {
        const data = {
            ...formData,
            percent: parseInt(formData.percent),
        };

        try {
            if (isEditing) {
                await fetchApi(`customer/${route.params.clientId}`, 'PUT', data)
            } else {
                await fetchApi('customer', 'POST', data)
            }
        } catch (error) {
            console.error('Ошибка отправки данных:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить клиента');
        }
        navigation.setParams({ refresh: true });
        console.log('Параметр refresh изменился:')

        navigation.goBack();
    };

    const handleDelete = async () => {
        Alert.alert(
            'Подтвердите удаление',
            'Вы уверены, что хотите удалить этого клиента?',
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
                {
                    text: 'Удалить',
                    onPress: async () => {
                        try {
                            await fetchApi(`customer/${route.params.clientId}`, 'DELETE');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Ошибка удаления:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить клиента');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Имя"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Телефон"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Процент"
                keyboardType="numeric"
                value={formData.percent}
                onChangeText={(text) => setFormData({ ...formData, percent: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="ID менеджера"
                value={formData.accountManager}
                onChangeText={(text) => setFormData({ ...formData, accountManager: text })}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>{isEditing ? 'Сохранить' : 'Создать'}</Text>
            </TouchableOpacity>

            {isEditing && (
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Удалить</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ClientForm;