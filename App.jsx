import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { Store } from './src/redux/Store';
import Routes from './src/routes/Routes';
import { Notifications } from 'react-native-notifications';
import Toast from 'react-native-toast-message';

Notifications.registerRemoteNotifications();

if (Platform.OS === 'android') {
  Notifications.setNotificationChannel({
    channelId: 'pdf-saved-channel',
    name: 'PDF Notifications',
    importance: 5,
    description: 'Shows when PDF is saved',
    enableLights: true,
    enableVibration: true,
    showBadge: true,
    sound: 'default',
  });
}
const App = () => {

  return (
    <Provider store={Store}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </SafeAreaView>
      <Toast />
    </Provider>
  );
};

export default App;
