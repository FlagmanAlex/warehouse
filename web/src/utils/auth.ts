// src/utils/auth.ts
import { redirect } from 'react-router-dom';
import type { IUser } from '@warehouse/interfaces'; // предполагаемый путь к интерфейсу пользователя

// Тип для пользователя без пароля
export type User = Omit<IUser, 'password'>;

// Тип возвращаемого значения для getUser
interface GetUserReturn extends User {
    token: string;
}

// 1. Получение токена авторизации
export const getAuthToken = (): string | null => {
  return localStorage.getItem('@auth_token');
};

// 2. Сохранение токена авторизации
export const setAuthToken = (token: string): void => {
  localStorage.setItem('@auth_token', token);
};

// 3. Удаление токена авторизации
export const removeAuthToken = (): void => {
  localStorage.removeItem('@auth_token');
};

// 4. Получение данных пользователя
export const getUser = (): GetUserReturn | null => {
  const userJson = localStorage.getItem('@user');
  if (!userJson) return null;
  
  try {
    const user: GetUserReturn = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Ошибка при парсинге данных пользователя из localStorage:', error);
    return null;
  }
};

// 5. Сохранение данных пользователя
export const setUser = (user: User): void => {
  localStorage.setItem('@user', JSON.stringify(user));
};

// 6. Удаление данных пользователя
export const removeUser = (): void => {
  localStorage.removeItem('@user');
};

// 7. Выход из системы
export const logout = (): void => {
  removeAuthToken();
  removeUser();
};

// 8. Тип для аргументов loader функции
interface LoaderArgs {
  params: Record<string, string | undefined>;
  request: Request;
}

// Тип для защищенного loader
type ProtectedLoaderFn = (args: LoaderArgs) => Promise<Response | Redirect | Record<string, unknown> | null>;
type Redirect = ReturnType<typeof redirect>;

// Защищенный loader (обёртка)
export const protectedLoader = (loaderFn: ProtectedLoaderFn) => {
  return async (args: LoaderArgs) => {
    const token = getAuthToken();
    if (!token) {
      return redirect('/login');
    }

    try {
      return await loaderFn(args);
    } catch (error: unknown) {
      // Проверяем, является ли ошибка Response с полем status
      if (error instanceof Error && 'status' in error) {
        const responseError = error as { status: number };
        if (responseError.status === 401 || responseError.status === 403) {
          logout();
          return redirect('/login');
        }
      }
      // Если это не ошибка с кодом 401/403, пробрасываем дальше
      throw error;
    }
  };
};

// 9. Проверка авторизации (для UI, если нужно)
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};