import { server } from "@warehouse/interfaces/config";

import type { NavigateFunction } from "react-router-dom";

let navigate: NavigateFunction | null = null;
// let authContext: { logout: () => Promise<void> };

export const setNavigation = (nav: NavigateFunction) => {
    navigate = nav;
};
export const getNavigation = () => navigate;



export const fetchApi = async <T = unknown>(
    url: string,
    method: 'POST' | 'PATCH' | 'GET' | 'DELETE' = 'GET',
    body?: object,
    headers: Record<string, string> = {}
): Promise<T> => {
    const token = localStorage.getItem('@auth_token');
    
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

        const uri = `${server}/api/${url}`
        console.log(uri);
        const response = await fetch(uri, requestOptions);

        // Если статус 401 — значит, токен просрочен или недействителен
        if (response.status === 401) {
            console.warn('Unauthorized. Redirecting to Login...');

            localStorage.removeItem('@auth_token');

            if (navigate) {
                navigate('/login', { replace: true });
            } else {
                window.location.href = '/login';
            }
            throw new Error('Требуется авторизация');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`❌ Ошибка выполнения запроса ${url}`, error);
        console.log('Тело запроса:', body);
        throw (error as Error);
    }
};