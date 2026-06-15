import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import AppText from './AppText';
import { APPCOLORS } from '../utils/APPCOLORS';
import { responsiveHeight, responsiveWidth } from '../utils/Responsive';

const BoxCards = ({ amount, gradientBottomColor, gradientTopColor, title }) => {
  return (
    <TouchableOpacity>
      <LinearGradient colors={[gradientTopColor, gradientBottomColor]} style={{ alignItems: 'center', justifyContent: 'center', width: responsiveWidth(28), marginLeft: 10, borderRadius: 10, height: responsiveHeight(10), gap: 5 }}>
        <AppText title={title} titleSize={1.5} titleWeight titleColor={APPCOLORS.WHITE} />
        <AppText title={amount ? Math.round(amount).toLocaleString() : 0} titleSize={1.8} titleWeight titleColor={APPCOLORS.WHITE} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default BoxCards;
