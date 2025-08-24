// types.ts

import { DocStatus, DocStatusIn, DocStatusOut, DocType } from "@interfaces";


// Типы
export type ProductStackParamList = {
    ProductList: undefined;
    ProductForm: { productId: string };
};

export type AuthStackParamList = {
    LoginScreen: undefined;
    RegisterScreen: undefined;
};

export type StockStackParamList = {
    'По складу': { itemId: number };
    'По товару': { productId: string };
};

export type ClientStackParamList = {
    ClientList: { refresh?: boolean };
    ClientForm: { customerId: string };
};

export type RootStackParamList = {
    MainDrawer: undefined;
    Auth: undefined;
};

export type OrderStackParamList = {
    OrderList: undefined;
    OrderForm: { orderId: string };
};

export type DocStackParamList = {
    DocScreen: undefined;
    DocForm: { docId: string };
};

export type DrawerParamList = {
    Stock: undefined;
    Product: undefined;
    Client: undefined;
    Order: undefined;
    Doc: undefined;
    Logout: undefined;
};


export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}