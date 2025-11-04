import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Auth from './Auth';
import Main from './Main';
import { useSelector } from 'react-redux';

const Stack = createStackNavigator();
const Routes = () => {
  const token = useSelector(state => state.Data.token)
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      {
        token ? (

          <Stack.Screen name="Main" component={Main} />
        ): (

          <Stack.Screen name="Auth" component={Auth} />
        )
      }
  </Stack.Navigator>
  )
}

export default Routes