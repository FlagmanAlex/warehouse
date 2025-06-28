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
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../../types/types';
import { StackNavigationProp } from '@react-navigation/stack';

// Типизация навигации

const LoginScreen = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { login } = useAuth();
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Ошибка', 'Заполните все поля');
            return;
        }

        try {
            const response = await fetchApi('auth/login', 'POST', { email, password });
            await login(response.token, response.user);
        } catch (error) {
            Alert.alert('Ошибка', 'Неверный логин или пароль');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Авторизация</Text>
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
            <Button title="Войти" onPress={handleLogin} color="#28a745" />
            <Button
                title="Зарегистрироваться"
                onPress={() => navigation.navigate('RegisterScreen')}
                color="#007bff"
            />
        </View>
    );
};

// Стили
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 20,
        paddingTop: 200,
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
});

export default LoginScreen;