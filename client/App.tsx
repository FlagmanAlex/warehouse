import React, { RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AuthProvider, useAuth } from './src/components/screens/AuthScreen/AuthContext';
// import { setNavigationRef, getNavigationRef } from './src/utils';
import StockWarehouse from './src/components/screens/StockScreen/StockWarehouse';
import StockProduct from './src/components/screens/StockScreen/StockProduct';
import ClientList from './src/components/screens/ClientScreen/ClientList';
import ClientForm from './src/components/screens/ClientScreen/ClientForm';
import ProductList from './src/components/screens/ProductScreen/ProductList';
import ProductForm from './src/components/screens/ProductScreen/ProductForm';
import OrderList from './src/components/screens/OrderScreen/OrderList';
import LoginScreen from './src/components/screens/AuthScreen/LoginScreen';
import RegisterScreen from './src/components/screens/AuthScreen/RegisterScreen';
import OrderForm from './src/components/screens/OrderScreen/OrderForm';
import {
  AuthStackParamList,
  ClientStackParamList,
  DrawerParamList,
  OrderStackParamList,
  ProductStackParamList,
  RootStackParamList,
  StockStackParamList
} from './src/types/types';


// Создаем навигаторы
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const ProductStack = createStackNavigator<ProductStackParamList>();
const ClientStack = createStackNavigator<ClientStackParamList>();
const OrderStack = createStackNavigator<OrderStackParamList>();
const StockStack = createStackNavigator<StockStackParamList>();
const DrawerStack = createDrawerNavigator<DrawerParamList>();

// Компоненты навигаторов
function StockStackNavigator() {
  return (
    <StockStack.Navigator>
      <StockStack.Screen name="По складу" component={StockWarehouse} />
      <StockStack.Screen name="По товару" component={StockProduct} />
    </StockStack.Navigator>
  );
}

function ClientsStackNavigator() {
  return (
    <ClientStack.Navigator>
      <ClientStack.Screen name="ClientList" component={ClientList} options={{ title: 'Список клиентов' }} />
      <ClientStack.Screen name="ClientForm" component={ClientForm} options={{ title: 'Форма клиента' }} />
    </ClientStack.Navigator>
  );
}

function ProductStackNavigator() {
  return (
    <ProductStack.Navigator>
      <ProductStack.Screen name="ProductList" component={ProductList} options={{ title: 'Список продуктов' }} />
      <ProductStack.Screen name="ProductForm" component={ProductForm} options={{ title: 'Редактировать продукт' }} />
    </ProductStack.Navigator>
  );
}

function OrderStackNavigator() {
  return (
    <OrderStack.Navigator>
      <OrderStack.Screen name="OrderList" component={OrderList} options={{ title: 'Список документов' }} />
      <OrderStack.Screen name="OrderForm" component={OrderForm} options={{ title: 'Редактировать документ' }} />
    </OrderStack.Navigator>
  );
}

function MainDrawerNavigator() {
  return (
    <DrawerStack.Navigator
      screenOptions={{
        swipeEdgeWidth: 150,
        drawerStyle: { width: 150 },
      }}
    >
      <DrawerStack.Screen
        name="Client"
        component={ClientsStackNavigator}
        options={{ drawerLabel: 'Клиенты', headerTitle: 'Клиенты' }}
      />
      <DrawerStack.Screen
        name="Product"
        component={ProductStackNavigator}
        options={{ drawerLabel: 'Продукты', headerTitle: 'Продукты' }}
      />
      <DrawerStack.Screen
        name="Stock"
        component={StockStackNavigator}
        options={{ drawerLabel: 'Остатки', headerTitle: 'Остатки' }}
      />
      <DrawerStack.Screen
        name="Order"
        component={OrderStackNavigator}
        options={{ drawerLabel: 'Заказы', headerTitle: 'Заказы' }}
      />
      <DrawerStack.Screen
        name="Logout"
        component={LogoutScreen}
        options={{ drawerLabel: 'Выход' }}
      />
    </DrawerStack.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <RootStack.Navigator>
      {isAuthenticated ? (
        <RootStack.Screen
          name="MainDrawer"
          component={MainDrawerNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <RootStack.Screen
          name="Auth"
          component={AuthStackNavigator}
          options={{ headerShown: false }}
        />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {

  return (
    <NavigationContainer>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}

const LogoutScreen = () => {
  useAuth().logout();
  return null;
}