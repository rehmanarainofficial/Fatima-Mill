import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Store, persistor } from './src/redux/Store';
import Routes from './src/routes/Routes';
import Toast from 'react-native-toast-message';
import { APPCOLORS } from './src/utils/APPCOLORS';
const App = () => {

  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar
          backgroundColor={APPCOLORS.Primary}
          barStyle="light-content"
          translucent={false}
        />
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }} edges={[]}>
            <NavigationContainer>
              <Routes />
            </NavigationContainer>
          </SafeAreaView>
          <Toast />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
