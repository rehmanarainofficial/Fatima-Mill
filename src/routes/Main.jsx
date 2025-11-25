import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Dashboard from '../screens/main/Dashboard';
import Detail from '../screens/main/stacks/DetailScreens/Detail';
import MoreDetail from '../screens/main/stacks/DetailScreens/MoreDetail';
import ViewAll from '../screens/main/stacks/DetailScreens/ViewAll';
import AlertScreen from '../screens/main/stacks/AppAlerts/AlertScreen';
import NormalViewAll from '../screens/main/stacks/DetailScreens/NormalViewAll';
import PdfScreen from '../screens/main/stacks/DetailScreens/PdfScreen';
import Aging from '../screens/main/stacks/AgingAndLedger/Aging';
import TopTenScreen from '../screens/main/stacks/DetailScreens/TopTen/TopTenScreen';
import ViewAllTopTen from '../screens/main/stacks/DetailScreens/TopTen/ViewAllTopTen';
import ShowUnapprovedDetails from '../screens/main/stacks/AppAlerts/ShowUnapprovedDetails';
import ViewLedger from '../screens/main/stacks/DetailScreens/ViewLedger';
import StockSheetScreen from '../screens/main/stacks/DetailScreens/StockSheetScreen';
import LedgersScreen from '../screens/main/stacks/AgingAndLedger/LedgersScreen';
import StockMovements from '../screens/main/stacks/AgingAndLedger/StockMovements';

const Stack = createStackNavigator();

const Main = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="MoreDetail" component={MoreDetail} />
      <Stack.Screen name="ViewAll" component={ViewAll} />
      <Stack.Screen name="AlertScreen" component={AlertScreen} />
      <Stack.Screen name="NormalViewAll" component={NormalViewAll} />
      <Stack.Screen name="PdfScreen" component={PdfScreen} />
      <Stack.Screen name="Aging" component={Aging} />
      <Stack.Screen name="TopTenScreen" component={TopTenScreen} />
      <Stack.Screen name="ViewAllTopTen" component={ViewAllTopTen} />

      <Stack.Screen name="ViewLedger" component={ViewLedger} />
      <Stack.Screen name="StockSheetScreen" component={StockSheetScreen} />
      <Stack.Screen name="StockMovements" component={StockMovements} />
      <Stack.Screen
        name="ShowUnapprovedDetails"
        component={ShowUnapprovedDetails}
      />
      <Stack.Screen name="Ledgers" component={LedgersScreen} />
    </Stack.Navigator>
  );
};

export default Main;
