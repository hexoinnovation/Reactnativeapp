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

// ✅ Stack Navigator for Dashboard (With Custom Navbar)
function DashboardStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <CustomHeader navigation={navigation} title="Dashboard" />,
      }}
    >
      <Stack.Screen name="Dashboard" component={Dashboard} />
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
          <Drawer.Navigator
            initialRouteName="Dashboard"
            screenOptions={{ headerShown: false }}  // ✅ Fix: Hide default header
          >
            <Drawer.Screen name="Dashboard" component={DashboardStack} />
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
