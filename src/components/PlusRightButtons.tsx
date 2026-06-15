import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { responsiveFontSize, responsiveWidth } from '../utils/Responsive';
import { APPCOLORS } from '../utils/APPCOLORS';
import AppText from './AppText';
import { useNavigation } from '@react-navigation/native';
type props = {
    title?: string
}



const PlusRightButtons = ({ title}: props) => {
  const nav = useNavigation();
  return (
    <TouchableOpacity onPress={()=> nav.navigate('AlertScreen')} style={{backgroundColor:APPCOLORS.BLACK, borderTopLeftRadius:200, borderBottomLeftRadius:200, width:responsiveWidth(20), alignItems:'center', flexDirection:'row', padding:10, gap:10, opacity:0.8}}>
        <AntDesign name={'pluscircle'} size={responsiveFontSize(2)} color={APPCOLORS.WHITE}/>
      <AppText title="Lorem" titleColor={APPCOLORS.WHITE}/>
    </TouchableOpacity>
  );
};

export default PlusRightButtons;
