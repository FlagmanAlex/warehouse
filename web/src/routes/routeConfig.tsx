import { Outlet, type RouteObject } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import { docLoader, docFormLoader, productLoader } from "./loaders";
import { protectedLoader } from "../utils/auth";
import { 
    ProductList, 
    ProductForm, 
    ClientList, 
    ClientForm, 
    DocForm, 
    DocScreen, 
    LoginScreen, 
    RegisterScreen, 
    AuthProvider, 
    NotFoundPage, 
    ErrorPage,
    StockProduct,
    StockWarehouse, 
} from "../component/Screens";

export const routeConfig: RouteObject[] = [
    {
        element: (
            <RootLayout>
                <AuthProvider>
                    <Outlet />
                </AuthProvider>
            </RootLayout>
        ),
        errorElement: <ErrorPage />,
        children: [
            { path: '/', element: <DocScreen />, loader: protectedLoader(docLoader) },
            { path: '/docs', element: <DocScreen />, loader: protectedLoader(docLoader) }, // docScreen вместо docsLoader },
            { path: '/doc-form/:id', element: <DocForm />, loader: protectedLoader(docFormLoader) }, // docFormLoader },
            { path: '/doc-form', element: <DocForm />, loader: protectedLoader(docFormLoader) }, // docFormLoader },
            { path: '/login', element: <LoginScreen /> },
            { path: '/register', element: <RegisterScreen /> },
            { path: '/clients', element: <ClientList /> },
            { path: '/client-form/:id', element: <ClientForm /> },
            { path: '/client-form', element: <ClientForm /> },
            { path: '/products', element: <ProductList />, loader: protectedLoader(productLoader) },
            { path: '/product-form/:id', element: <ProductForm /> },
            { path: '/product-form', element: <ProductForm /> },
            { path: '/stock-product/:productId', element: <StockProduct /> },
            { path: '/stock-warehouse', element: <StockWarehouse /> },
            { path: '*', element: <NotFoundPage /> },
        ]
    }
]
