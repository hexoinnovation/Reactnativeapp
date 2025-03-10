import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Provider, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { theme } from './src/core/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import Screens
import StartScreen from './src/screens/StartScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import Dashboard from './src/screens/Dashboard';
import Purchase from './src/screens/Purchase';
import Stock from './src/screens/Stock';
import Sales from './src/screens/Sales';
import EndProduct from './src/screens/EndProduct';
import Invoice from './src/screens/Invoice';
import AllInvoices from './src/screens/AllInvoices';
import CustomerDetails from './src/screens/CustomerDetails';
import BusinessDetails from './src/screens/BusinessDetails';
import EmployeeDetails from './src/screens/EmployeeDetails';
import Attendance from './src/screens/Attendance';
import Salary from './src/screens/Salary';

// Create Navigators
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// ✅ Custom Header with Menu Button
const CustomHeader = ({ navigation, title }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: 60,
      backgroundColor: '#6200ee',
      paddingHorizontal: 15,
    }}
  >
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 15 }}>
      <Icon name="menu" size={30} color="white" />
    </TouchableOpacity>
    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
  </View>
);

// ✅ Generic Stack Navigator (For Each Section)
const createStack = (screenName, Component, title) => {
  return function StackNavigator({ navigation }) {
    return (
      <Stack.Navigator
        screenOptions={{
          header: () => <CustomHeader navigation={navigation} title={title} />,
        }}
      >
        <Stack.Screen name={screenName} component={Component} />
      </Stack.Navigator>
    );
  };
};

// ✅ Sidebar Drawer Navigator
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Provider theme={theme}>
      <NavigationContainer>
        {isLoggedIn ? (
          <Drawer.Navigator
            initialRouteName="Dashboard"
            screenOptions={{ headerShown: false }}
          >
            <Drawer.Screen name="Dashboard" component={createStack("Dashboard", Dashboard, "Dashboard")} />
            <Drawer.Screen name="Purchase" component={createStack("Purchase", Purchase, "Purchase")} />
            <Drawer.Screen name="Stock" component={createStack("Stock", Stock, "Stock")} />
            <Drawer.Screen name="Sales" component={createStack("Sales", Sales, "Sales")} />
            <Drawer.Screen name="End Product" component={createStack("EndProduct", EndProduct, "End Product")} />
            <Drawer.Screen name="Invoice" component={createStack("Invoice", Invoice, "Invoice")} />
            <Drawer.Screen name="All Invoices" component={createStack("AllInvoices", AllInvoices, "All Invoices")} />
            <Drawer.Screen name="Customer Details" component={createStack("CustomerDetails", CustomerDetails, "Customer Details")} />
            <Drawer.Screen name="Business Details" component={createStack("BusinessDetails", BusinessDetails, "Business Details")} />
            <Drawer.Screen name="Employee Details" component={createStack("EmployeeDetails", EmployeeDetails, "Employee Details")} />
            <Drawer.Screen name="Attendance" component={createStack("Attendance", Attendance, "Attendance")} />
            <Drawer.Screen name="Salary" component={createStack("Salary", Salary, "Salary")} />
          </Drawer.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LoginScreen">
              {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </Provider>
  );
};

// ✅ Wrap with gestureHandlerRootHOC for Web
export default gestureHandlerRootHOC(App);
