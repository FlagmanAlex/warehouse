// types.ts


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
    ClientForm: { clientId: string };
};

export type RootStackParamList = {
    MainDrawer: undefined;
    Auth: undefined;
};

export type OrderStackParamList = {
    OrderList: undefined;
    OrderForm: { orderId: string };
};

export type DrawerParamList = {
    Stock: undefined;
    Product: undefined;
    Client: undefined;
    Order: undefined;
    Logout: undefined;
};

export interface Client {
    _id: string;
    name: string;
    phone: string;
    address: string;
    percent: number;
    accountManager: string;
    __v?: number;
}

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

export interface Product {
    _id: string;
    name: string;
    article: string;
    categoryId: {
        _id: string;
        name: string;
    };
    unitOfMeasurement: string;
    price: number;
    isArchived: boolean;
    createdBy: {
        _id: string;
        username: string;
    };
    lastUpdateBy: {
        _id: string;
        username: string;
    };
    supplierId: {
        _id: string;
        name: string;
    };
}

export interface Category {
    _id: string;
    name: string;
}

// Интерфейсы для сущностей
interface ICustomer {
    _id: string;
    name: string;
    phone: string;
    address: string;
    gps: string;
    percent: number;
    accountManager: string;
    __v: number;
}

interface IWarehouse {
    _id: string;
    name: string;
    userId: string;
    __v: number;
}

interface IOrderDetail {
    _id: string;
    orderId: string;
    productId: IProduct;
    batchId: string | null;
    quantity: number;
    unitPrice: number;
    bonusStock: number;
    __v: number;
}

interface IOrder {
    _id: string;
    orderNum: string;
    orderDate: string;
    orderType: string;
    customerId: ICustomer;
    supplierId: string | null;
    warehouseId: IWarehouse;
    status: string;
    userId: string;
    __v: number;
}

export interface IOrderResponse {
    order: IOrder;
    details: IOrderDetail[];
}