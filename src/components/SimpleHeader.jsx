import { View, Text, TouchableOpacity, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import AppText from './AppText';
import { APPCOLORS } from '../utils/APPCOLORS';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils/Responsive';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const SimpleHeader = ({ title, showDownload = false, onDownload, downloadLoading = false, downloadDisabled = false }) => {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <LinearGradient
      colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: responsiveWidth(5),
        height: responsiveHeight(Platform.OS === 'ios' ? 10 : 14) + (Platform.OS === 'ios' ? insets.top : 0), // Increased height for iOS
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        paddingTop: Platform.OS === 'ios' ? insets.top + responsiveHeight(1) : 14, // Adjusted paddingTop for iOS
        width: width, // Keep full width
      }}>
      {/* Left: Back Button */}
      <TouchableOpacity onPress={() => nav.goBack()} style={{ padding: 5 }}>
        <Ionicons
          name={'arrow-back'}
          size={responsiveFontSize(3)}
          color={APPCOLORS.WHITE}
        />
      </TouchableOpacity>

      {/* Center: Title */}
      < AppText
        title={title}
        titleColor={APPCOLORS.WHITE}
        titleSize={3}
        titleWeight
      />

      {/* Right: Download Button or Profile */}
      {
        showDownload ? (
          <TouchableOpacity
            onPress={onDownload}
            disabled={downloadDisabled}
          >
            {downloadLoading ? (
              <ActivityIndicator size="small" color={APPCOLORS.WHITE} />
            ) : (
              <Ionicons
                name={'download-outline'}
                size={responsiveFontSize(3)}
                color={downloadDisabled ? APPCOLORS.TEXTFIELDCOLOR : APPCOLORS.WHITE}
              />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => nav.navigate('Dashboard')} style={{ padding: 5 }}>
            <Ionicons
              name={'person'}
              size={responsiveFontSize(3)}
              color={APPCOLORS.WHITE}
            />
          </TouchableOpacity>
        )
      }
    </LinearGradient >
  );
};

export default SimpleHeader;
