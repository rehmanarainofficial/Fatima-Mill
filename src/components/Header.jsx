import { View, Text, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils/Responsive';
import { APPCOLORS } from '../utils/APPCOLORS';

const Header = ({ title, onRightPress, rightIcon, onBack }) => {
  return (
    <LinearGradient
      colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        height: responsiveHeight(Platform.OS === 'ios' ? 8 : 9),
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingHorizontal: responsiveWidth(4),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        paddingTop: Platform.OS === 'ios' ? 0 : 5,
        width: '100%',
      }}>
      {/* 🔙 Back Button */}
      <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
        <Icon
          name="arrow-back-ios"
          size={responsiveFontSize(2.5)}
          color={APPCOLORS.WHITE}
        />
      </TouchableOpacity>

      {/* 🧭 Title */}
      <Text
        style={{
          fontSize: responsiveFontSize(2.4),
          color: APPCOLORS.WHITE,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        }}>
        {title}
      </Text>

      {/* ⚙️ Right Icon */}
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={{ padding: 4 }}>
          <Icon name={rightIcon} size={responsiveFontSize(2.8)} color={APPCOLORS.WHITE} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: responsiveWidth(6) }} /> // spacer jab right icon na ho
      )}
    </LinearGradient>
  );
};

export default Header;
