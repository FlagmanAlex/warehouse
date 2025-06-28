import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApi } from '../../../utils';

type User = {
    _id: string;
    username: string;
    email: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (token: string, user: User) => {
        try {
            await AsyncStorage.setItem('@auth_token', token);
            await AsyncStorage.setItem('@user', JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Ошибка сохранения данных аутентификации:", error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('@auth_token');
            await AsyncStorage.removeItem('@user');
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('@auth_token');
                const storedUser = await AsyncStorage.getItem('@user');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);

                    // Проверяем валидность токена
                    try {
                        await fetchApi('auth/check', 'GET', {});
                    } catch (error) {
                        await logout();
                        throw error;
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};