import { View, Text, TextInput } from 'react-native';
import React from 'react';
import { APPCOLORS } from '../utils/APPCOLORS';
import { responsiveHeight, responsiveWidth } from '../utils/Responsive';

type props = {
    moreStyle?: any,
    logo?: any,
    placeHolder?: string,
    isPassword?: boolean,
    onChangeText?: (text: string) => void,
    value?: string,
    txtColor?: any
    secureTextEntry?:boolean
}

const AppInput = ({isPassword, logo, moreStyle, placeHolder,onChangeText,value, txtColor, secureTextEntry}: props) => {
  return (
    <View style={{borderWidth:1, borderRadius:10, borderColor:APPCOLORS.WHITE, flexDirection:'row', alignItems:'center',  width:responsiveWidth(90), paddingHorizontal:15 , gap:10}}>
        {
            logo
        }
      <TextInput
        placeholder={placeHolder}
        placeholderTextColor={APPCOLORS.WHITE}
        style={{height:responsiveHeight(5), width:responsiveWidth(75), color: txtColor || APPCOLORS.BLACK }}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

export default AppInput;
