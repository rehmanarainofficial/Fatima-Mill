import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive';
import {APPCOLORS} from '../utils/APPCOLORS';

const Header = ({title, onRightPress, rightIcon, onBack, rightElement}) => {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  return (
    <LinearGradient
      colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={{
        height:
          responsiveHeight(Platform.OS === 'ios' ? 12 : 11) +
          (Platform.OS === 'ios' ? insets.top : 0),
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingHorizontal: responsiveWidth(4),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 6,
        paddingTop:
          Platform.OS === 'ios' ? insets.top + responsiveHeight(1) : 10,
        width: width,
      }}>
      {/* 🔙 Back Button */}
      <TouchableOpacity onPress={onBack} style={{padding: 4}}>
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

      {/* ⚙️ Right Icon / Element */}
      {rightElement ? (
        rightElement
      ) : rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={{padding: 4}}>
          <Icon
            name={rightIcon}
            size={responsiveFontSize(2.8)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>
      ) : (
        <View style={{width: responsiveWidth(6)}} /> // spacer jab right icon na ho
      )}
    </LinearGradient>
  );
};

export default Header;
