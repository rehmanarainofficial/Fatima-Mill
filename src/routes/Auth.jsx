import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/auth/Login';

const Stack = createStackNavigator();
const Auth = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
    <Stack.Screen name="Login" component={Login} />
  </Stack.Navigator>
  );
};

export default Auth;
