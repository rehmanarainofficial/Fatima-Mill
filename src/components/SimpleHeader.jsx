import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { APPCOLORS } from '../utils/APPCOLORS';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';

const SimpleHeader = ({
  title,
  showDownload = false,
  onDownload,
  downloadLoading = false,
  downloadDisabled = false,
}) => {
  const nav = useNavigation();
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
      <TouchableOpacity onPress={() => nav.goBack()} style={styles.sideButton}>
        <Ionicons
          name={'arrow-back'}
          size={responsiveFontSize(3)}
          color={APPCOLORS.WHITE}
        />
      </TouchableOpacity>

      <View style={styles.titleWrap}>
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}>
          {title}
        </Text>
      </View>

      <View style={styles.sideSlot}>
        {showDownload ? (
          <TouchableOpacity
            onPress={onDownload}
            disabled={downloadDisabled}
            style={styles.sideButton}>
            {downloadLoading ? (
              <ActivityIndicator size="small" color={APPCOLORS.WHITE} />
            ) : (
              <Ionicons
                name={'download-outline'}
                size={responsiveFontSize(3)}
                color={
                  downloadDisabled ? APPCOLORS.TEXTFIELDCOLOR : APPCOLORS.WHITE
                }
              />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => nav.navigate('Dashboard')}
            style={styles.sideButton}>
            <Ionicons
              name={'person'}
              size={responsiveFontSize(3)}
              color={APPCOLORS.WHITE}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: APPCOLORS.Primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    shadowColor: APPCOLORS.BLACK,
    shadowOpacity: 0.18,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    width: '100%',
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
  titleWrap: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: APPCOLORS.WHITE,
    fontSize: responsiveFontSize(2.55),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SimpleHeader;
