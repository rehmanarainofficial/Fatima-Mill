import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import AppText from './AppText';
import { APPCOLORS } from '../utils/APPCOLORS';

type props = {
    data?: any,
    title?: string,
    onPress?:()=>  null
}

const TopTen = ({data,title, onPress}:props) => {
  return (
    <TouchableOpacity onPress={onPress} style={{padding:20, alignItems:'center', justifyContent:'center', backgroundColor:APPCOLORS.BarColor, borderRadius:20}}>
        <AppText title={title} titleSize={2} titleWeight/>
    </TouchableOpacity>
  );
};

export default TopTen;
