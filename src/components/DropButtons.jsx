import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { APPCOLORS } from '../utils/APPCOLORS';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils/Responsive';
import AppText from './AppText';
import AntDesign from 'react-native-vector-icons/AntDesign';
const DropButtons = ({ buttonWith = 30, onPress, title }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: APPCOLORS.Primary,
        height: responsiveHeight(5),
        width: responsiveWidth(buttonWith),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 30,

      }}
      onPress={onPress}
    >
      <AppText title={title} titleColor={APPCOLORS.WHITE} titleWeight />

      <AntDesign
        name={'down'}
        size={responsiveFontSize(2)}
        color={APPCOLORS.WHITE}

      />

    </TouchableOpacity>
  );
};

export default DropButtons;
