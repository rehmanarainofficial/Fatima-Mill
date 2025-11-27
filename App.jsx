import { SafeAreaView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Store, persistor } from './src/redux/Store';
import Routes from './src/routes/Routes';
import Toast from 'react-native-toast-message';

const App = () => {

  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationContainer>
            <Routes />
          </NavigationContainer>
        </SafeAreaView>
        <Toast />
      </PersistGate>
    </Provider>
  );
};

export default App;
