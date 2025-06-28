// src/screens/auth/RegisterScreen.tsx

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Text,
    StyleSheet,
    Alert,
} from 'react-native';
import { fetchApi } from '../../../utils';
import { useNavigation } from '@react-navigation/native';

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

const RegisterScreen = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert('Ошибка', 'Заполните все поля');
            return;
        }

        try {
            await fetchApi('auth/register', 'POST', {
                username,
                email,
                password,
                role: 'user' // по умолчанию пользователь
            });

            Alert.alert('Успех', 'Вы успешно зарегистрировались!');
            navigation.goBack(); // Возвращаемся обратно на экран входа
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось зарегистрироваться. Попробуйте позже.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Регистрация</Text>
            <TextInput
                placeholder="Имя пользователя"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <Button title="Зарегистрироваться" onPress={handleRegister} color="#28a745" />

            <Button
                title="Вернуться к входу"
                onPress={() => navigation.goBack()}
                color="#6c757d"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 20,
        paddingTop: 150,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    backButton: {
        marginTop: 20,
    },
});

export default RegisterScreen;