import React, { useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { Store } from './redux/Store';
import Routes from './routes/Routes';
import { Notifications } from 'react-native-notifications';
import Toast from 'react-native-toast-message';

const App = () => {

  useEffect(() => {
    Notifications.registerRemoteNotifications();

    Notifications.events().registerNotificationReceivedForeground(
      (notification, completion) => {
        console.log('Notification received in foreground:', notification.payload);
        completion({ alert: true, sound: true, badge: false });
      }
    );

    Notifications.events().registerNotificationOpened(
      (notification, completion) => {
        console.log('Notification opened:', notification.payload);
        completion();
      }
    );
  }, []); // ✅ run once safely

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
