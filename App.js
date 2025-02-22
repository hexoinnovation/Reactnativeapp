import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import Screens
import Dashboard from './src/screens/Dashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Create Navigators
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

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

// ✅ Stack Navigator for Home/Dashboard
function HomeStack({ navigation }) {
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

// ✅ Main Drawer Navigation
function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// ✅ Main App
export default function App() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}
