import { View, Text } from 'react-native';
import React from 'react';
import AppText from './AppText';
import { APPCOLORS } from '../utils/APPCOLORS';
import { responsiveHeight, responsiveWidth } from '../utils/Responsive';
type props = {
    title?: string,
    barColor?: any
}
const NameAndBar = ({barColor, title}: props) => {
  return (
    <View style={{gap:5}}>
            <AppText title={title} titleWeight titleSize={1.5} titleColor={APPCOLORS.BLACK}/>
            <View style={{height:responsiveHeight(2.5), borderRadius:200, backgroundColor:barColor, width:responsiveWidth(90)}}/>
    </View>
  );
};

export default NameAndBar;
