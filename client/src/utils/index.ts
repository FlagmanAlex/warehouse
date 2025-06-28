import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainerRef } from '@react-navigation/native';

const server = 'http://192.168.50.100:5050';

let navigationRef: NavigationContainerRef<any>;
// let authContext: { logout: () => Promise<void> };

export const setNavigationRef = (ref: NavigationContainerRef<any>) => {
    navigationRef = ref;
};
export const getNavigationRef = () => navigationRef;

// export const setAuthContext = (context: { logout: () => Promise<void> }) => {
//     authContext = context;
// };
// export const getAuthContext = () => authContext;

export const fetchApi = async <T = any>(
    url: string,
    method: 'POST' | 'PUT' | 'GET' | 'DELETE' = 'GET',
    body?: object,
    headers: Record<string, string> = {}
): Promise<T> => {
    const token = await AsyncStorage.getItem('@auth_token');

    try {
        const requestOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...headers
            }
        };

        if (body && method !== 'GET') {
            requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(`${server}/api/${url}`, requestOptions);

        // Если статус 401 — значит, токен просрочен или недействителен
        if (response.status === 401) {
            console.warn('Unauthorized. Redirecting to Login...');
            if (navigationRef?.isReady()) {
                navigationRef.navigate('Auth', { screen: 'LoginScreen' });
            }
            throw new Error('Требуется авторизация');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
        }

        return await response.json();

    } catch (error) {
        // console.error(`❌ Ошибка выполнения запроса ${url}`, error);
        // console.log('Тело запроса:', body);
        throw (error as Error);
    }
};