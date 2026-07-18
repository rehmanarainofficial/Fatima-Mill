import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive';
import {APPCOLORS} from '../utils/APPCOLORS';

const Header = ({title, onRightPress, rightIcon, onBack, rightElement}) => {
  const insets = useSafeAreaInsets();
  const contentHeight = Math.min(
    Math.max(responsiveHeight(7.5), Platform.OS === 'ios' ? 60 : 58),
    76,
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: contentHeight + insets.top,
          paddingTop: insets.top,
        },
      ]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.sideButton}>
          <Icon
            name="arrow-back-ios"
            size={responsiveFontSize(2.7)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>

        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}>
          {title}
        </Text>

        <View style={styles.sideSlot}>
          {rightElement ? (
            rightElement
          ) : rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
              <Icon
                name={rightIcon}
                size={responsiveFontSize(2.9)}
                color={APPCOLORS.WHITE}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APPCOLORS.Primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: APPCOLORS.BLACK,
    shadowOpacity: 0.18,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
  },
  sideButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: responsiveWidth(14),
  },
  sideSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    width: responsiveWidth(14),
  },
  rightButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    color: APPCOLORS.WHITE,
    flex: 1,
    fontSize: responsiveFontSize(2.55),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Header;
