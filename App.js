import React, { useState } from 'react';
import { Provider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { theme } from './src/core/theme';

// Import Screens
import {
  StartScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  Dashboard
} from './src/screens';

// Create Navigators
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// ✅ Stack Navigator for Authentication (Login/Register)
function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen">
        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

// ✅ Stack Navigator for Dashboard (With Header)
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 18 }
      }}
    >
      <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
    </Stack.Navigator>
  );
}

// ✅ Main App Navigator
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Provider theme={theme}>
      <NavigationContainer>
        {isLoggedIn ? (
          <Drawer.Navigator initialRouteName="Dashboard">
            <Drawer.Screen name="Dashboard" component={DashboardStack} />
          </Drawer.Navigator>
        ) : (
          <AuthStack setIsLoggedIn={setIsLoggedIn} />
        )}
      </NavigationContainer>
    </Provider>
  );
};

// ✅ Wrap with gestureHandlerRootHOC for Web
export default Platform.OS === 'web' ? gestureHandlerRootHOC(App) : App;
