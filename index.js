import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';

// Optimize screen performance for mobile
if (Platform.OS !== 'web') {
  enableScreens();
}

// Ensure gesture handling works across platforms
const WrappedApp = gestureHandlerRootHOC(App);

// Register the app for mobile
AppRegistry.registerComponent(appName, () => WrappedApp);

// Register the app for web
if (Platform.OS === 'web') {
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}
