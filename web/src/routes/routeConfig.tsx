import React from "react";
import { Outlet, type RouteObject } from "react-router-dom";
import { RootLayout } from "../layout/RootLayout";
import { docLoader, docFormLoader, productLoader, productFormLoader } from "./loaders";
import { protectedLoader } from "../utils/auth";
import { customerFormLoader } from "./loaders/customerFormLoader";
import { AuthProvider } from "../component/Screens/AuthScreen/AuthContext";
import { NotFoundPage } from "../component/Screens/NotFoundPage";
import { ErrorPage } from "../component/Screens/ErrorPage";
import DocScreen from "../component/Screens/DocScreen/DocScreen";
import DocForm from "../component/Screens/DocScreen/DocForm/DocForm";
import LoginScreen from "../component/Screens/AuthScreen/LoginScreen";
import RegisterScreen from "../component/Screens/AuthScreen/RegisterScreen";
import CustomerList from "../component/Screens/CustomerScreen/CustomerList";
import CustomerForm from "../component/Screens/CustomerScreen/CustomerForm";
import ProductList from "../component/Screens/ProductScreen/ProductList";
import ProductForm from "../component/Screens/ProductScreen/ProductForm";
import StockProduct from "../component/Screens/StockScreen/StockProduct";
import StockWarehouse from "../component/Screens/StockScreen/StockWarehouse";
import { customerLoader } from "./loaders/customerLoader";
import { docAction } from "./actions/docAction";
import { customerAction } from "./actions/customerAction";


export const routeConfig: RouteObject[] = [
    {
        element: (
            <RootLayout>
                <AuthProvider>
                    <React.Suspense fallback={<div>Загрузка...</div>}>
                        <Outlet />
                    </React.Suspense>
                </AuthProvider>
            </RootLayout>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <DocScreen />,
                loader: protectedLoader(docLoader),
                errorElement: <ErrorPage />
            },
            {
                path: '/docs',
                element: <DocScreen />,
                loader: protectedLoader(docLoader),
                errorElement: <ErrorPage />
            },
            {
                path: '/doc/:id',
                element: <DocForm />,
                loader: protectedLoader(docFormLoader),
                action: docAction,
                errorElement: <ErrorPage />
            },
            {
                path: '/doc',
                element: <DocForm />,
                loader: protectedLoader(docFormLoader),
                action: docAction,
                errorElement: <ErrorPage />
            },
            {
                path: '/login',
                element: <LoginScreen />
            },
            {
                path: '/register',
                element: <RegisterScreen />
            },
            {
                path: '/customers',
                element: <CustomerList />,
                loader: protectedLoader(customerLoader)

            },
            {
                path: '/customer/:customerId',
                element: <CustomerForm />,
                loader: protectedLoader(customerFormLoader),
                action: customerAction
            },
            {
                path: '/customer',
                element: <CustomerForm />,
                loader: protectedLoader(customerFormLoader),
                action: customerAction
            },
            {
                path: '/products',
                element: <ProductList />,
                loader: protectedLoader(productLoader)
            },
            {
                path: '/product-form/:productId',
                element: <ProductForm />,
                loader: protectedLoader(productFormLoader),
                errorElement: <ErrorPage />,
            },
            {
                path: '/product-form',
                element: <ProductForm />,
                loader: protectedLoader(productFormLoader),
                errorElement: <ErrorPage />
            },
            { path: '/stock-product/:productId', element: <StockProduct /> },
            { path: '/stock-warehouse', element: <StockWarehouse /> },
            { path: '*', element: <NotFoundPage /> },
        ]
    }
]
