import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { responsiveHeight } from '../utils/Responsive';
import { APPCOLORS } from '../utils/APPCOLORS';
import AppText from './AppText';

type Props = {
  logo?: any;
  name?: string;
  isNew?: boolean; // changed 'new' to 'isNew'
  onPress?: () => void,
  img: any
};

const DashboardTabs = ({ logo, name, isNew,onPress, img }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} style={{height:responsiveHeight(12), width:responsiveHeight(12), backgroundColor:APPCOLORS.BarColor, borderRadius:20, alignItems:'center', justifyContent:'center', gap:10, paddingHorizontal:15}}>
      <Image source={img} style={{height:responsiveHeight(4), width:responsiveHeight(4)}}/>
      <AppText title={name} titleAlignment={'center'} titleColor={APPCOLORS.WHITE} titleSize={1.7} titleWeight/>
    </TouchableOpacity>
  );
};



export default DashboardTabs;
