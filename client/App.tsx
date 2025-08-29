import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
  DocStackParamList,
  DrawerParamList,
  OrderStackParamList,
  ProductStackParamList,
  RootStackParamList,
  StockStackParamList
} from './src/types/types';
import { DocScreen } from './src/components/screens/DocScreen/DocScreen';
import DocForm from './src/components/screens/DocScreen/DocForm/DocForm';
import { ActivityIndicator } from 'react-native';


// Создаем навигаторы
const RootStack = createStackNavigator<RootStackParamList>();
const DrawerStack = createDrawerNavigator<DrawerParamList>();

const AuthStack = createStackNavigator<AuthStackParamList>();
const ProductStack = createStackNavigator<ProductStackParamList>();
const ClientStack = createStackNavigator<ClientStackParamList>();
const OrderStack = createStackNavigator<OrderStackParamList>();
const StockStack = createStackNavigator<StockStackParamList>();
const DocStack = createStackNavigator<DocStackParamList>();

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
      <ClientStack.Screen name="ClientForm" component={ClientForm} options={{ title: 'Карточка клиента' }} />
    </ClientStack.Navigator>
  );
}

function ProductStackNavigator() {
  return (
    <ProductStack.Navigator>
      <ProductStack.Screen name="ProductList" component={ProductList} options={{ title: 'Список продуктов' }} />
      <ProductStack.Screen name="ProductForm" component={ProductForm} options={{ title: 'Карточка продукта' }} />
    </ProductStack.Navigator>
  );
}

function OrderStackNavigator() {
  return (
    <OrderStack.Navigator>
      <OrderStack.Screen name="OrderList" component={OrderList} options={{ title: 'Список заказов' }} />
      <OrderStack.Screen name="OrderForm" component={OrderForm} options={{ title: 'Форма заказа' }} />
    </OrderStack.Navigator>
  );
}

function DocStackNavigator() {
  return (
    <DocStack.Navigator>
      <DocStack.Screen name="DocScreen" component={DocScreen} options={{ title: 'Список документов' }} />
      <DocStack.Screen name="DocForm" component={DocForm} options={{ title: 'Форма документа' }} />
    </DocStack.Navigator>
  );
}

function MainDrawerNavigator() {
  return (
    <DrawerStack.Navigator
      screenOptions={{
        swipeEdgeWidth: 150,
        drawerStyle: { width: 160, },
      }}
    >
      <DrawerStack.Screen
        name="Doc"
        component={DocStackNavigator}
        options={{ drawerLabel: 'Документы', headerTitle: 'Документы' }}
      />
      <DrawerStack.Screen
        name="Order"
        component={OrderStackNavigator}
        options={{ drawerLabel: 'Заказы', headerTitle: 'Заказы' }}
      />
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
  console.log('isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return <><ActivityIndicator /></>;
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

const LogoutScreen = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return null;
}

export default function App() {

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
