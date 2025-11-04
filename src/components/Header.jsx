import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { responsiveFontSize, responsiveHeight } from '../utils/Responsive';

const SimpleHeader = ({ title, onRightPress, rightIcon, onBack }) => {
  return (
    <LinearGradient
      colors={['#1D4452', '#4199B8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        height: responsiveHeight(9),
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
      }}>
      {/* 🔙 Back Button */}
      <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
        <Icon name="arrow-back-ios" size={22} color="#fff" />
      </TouchableOpacity>

      {/* 🧭 Title */}
      <Text
        style={{
          fontSize: responsiveFontSize(2.4),
          color: '#fff',
          fontWeight: 'bold',
          letterSpacing: 0.5,
        }}>
        {title}
      </Text>

      {/* ⚙️ Right Icon */}
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={{ padding: 4 }}>
          <Icon name={rightIcon} size={25} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 25 }} /> // spacer jab right icon na ho
      )}
    </LinearGradient>
  );
};

export default SimpleHeader;
