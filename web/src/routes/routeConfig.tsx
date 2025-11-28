import React from "react";
import { Outlet, type RouteObject } from "react-router-dom";
import { RootLayout } from "../layout/RootLayout";
import { docLoader, docFormLoader, productLoader, productFormLoader, deliveryNewLoader } from "./loaders";
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
import { docAction } from "./actions/docFormAction";
import { customerAction } from "./actions/customerFormAction";
import { InProgressReport } from "../pages/Reports";
import { inProgressReportLoader, inDeliveryReportLoader } from "./loaders";
import InProgressReportByCustomer from "../pages/Reports/InPtrogressReportByCustomer";
import InDeliveryReportByCustomer from "../pages/Reports/InDeliveryReportByCustomer";
import { DeliveryList } from "../component/Screens/DeliveryScreen/DeliveryList";
import { deliveryLoader } from "./loaders/deliveryLoader";
import { deliveryAction } from "./actions/deliveryAction";
import { DeliveryNew } from "../component/Screens/DeliveryScreen/DeliveryNew";
import { DeliveryForm } from "../component/Screens/DeliveryScreen/DeliveryForm";


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
            {
                path: 'inprogress-report',
                element: <InProgressReport />,
                loader: protectedLoader(inProgressReportLoader)
            },
            {
                path: 'inprogress-report-by-customer',
                element: <InProgressReportByCustomer />,
                loader: protectedLoader(inProgressReportLoader)
            },
            {
                path: 'indelivery-report-by-customer',
                element: <InDeliveryReportByCustomer />,
                loader: protectedLoader(inDeliveryReportLoader)
            },
            {
                path: 'delivery-planning',
                element: <DeliveryList />,
                loader: protectedLoader(deliveryLoader),
                action: deliveryAction
            },
            {
                path: 'delivery-planning/new',
                element: <DeliveryNew />,
                loader: protectedLoader(deliveryNewLoader),
                action: deliveryAction
            },
            { path: '/stock-product/:productId', element: <StockProduct /> },
            { path: '/delivery-planning/:id', 
                element: <DeliveryForm />,
                action: deliveryAction, 
                loader: protectedLoader(deliveryLoader),
            },
            { path: '/stock-warehouse', element: <StockWarehouse /> },
            { path: '*', element: <NotFoundPage /> },
        ]
    }
]
