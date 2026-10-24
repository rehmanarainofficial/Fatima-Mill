import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useRef, useEffect} from 'react';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive';
import {APPCOLORS} from '../utils/APPCOLORS';
import AppText from './AppText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {setLogout, switchCompanyAndSync} from '../redux/AuthSlice';
import {clearDashboardCache} from '../screens/main/Dashboard';
import {clearDetailCache} from '../screens/main/stacks/DetailScreens/Detail';

const getInitials = name => {
  if (!name || typeof name !== 'string') {
    return '';
  }
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return '';
};

const AppHeader = ({title, onPress}) => {
  const {currentData, activeCompany, selectedCompany} = useSelector(
    state => state.Data || {},
  );
  const userData = Array.isArray(currentData) ? currentData[0] : currentData;
  const userName = userData?.real_name || '';
  const roleId = String(userData?.role_id ?? '');
  const isRole2 = roleId === '2';

  const currentCompCode = activeCompany || 'company1';
  const currentCompLabel =
    selectedCompany || (currentCompCode === 'company2' ? 'FBPM' : 'IBR-ENT');
  const companyName = userData?.company_name || currentCompLabel || 'DeSolutions';
  const userInitials = getInitials(userName);

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSwitchCompany = (targetCode, targetLabel) => {
    if (targetCode === currentCompCode) {
      return;
    }
    clearDashboardCache();
    clearDetailCache();
    dispatch(
      switchCompanyAndSync({
        company: targetCode,
        companyLabel: targetLabel,
      }),
    );
  };

  return (
    <Animated.View style={{opacity: fadeAnim, width: '100%'}}>
      <View
        style={{
          backgroundColor: '#0784B5',
          height:
            Platform.OS === 'ios'
              ? responsiveHeight(15) + insets.top
              : responsiveHeight(15) + insets.top,
          borderBottomRightRadius: 25,
          borderBottomLeftRadius: 25,
          paddingHorizontal: responsiveWidth(Platform.OS === 'ios' ? 3 : 5),
          paddingTop: insets.top + (Platform.OS === 'ios' ? 15 : 10),
          width: width,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flex: 1, marginRight: 10}}>
            {isRole2 ? (
              <View style={styles.switcherContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSwitchCompany('company1', 'IBR-ENT')}
                  style={[
                    styles.switcherBtn,
                    currentCompCode === 'company1' && styles.switcherBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.switcherText,
                      currentCompCode === 'company1' &&
                        styles.switcherTextActive,
                    ]}>
                    IBR-ENT
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSwitchCompany('company2', 'FBPM')}
                  style={[
                    styles.switcherBtn,
                    currentCompCode === 'company2' && styles.switcherBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.switcherText,
                      currentCompCode === 'company2' &&
                        styles.switcherTextActive,
                    ]}>
                    FBPM
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <AppText
                title={companyName}
                titleColor={APPCOLORS.WHITE}
                titleSize={companyName.length > 25 ? 2.1 : 2.5}
                titleWeight
                numberOfLines={1}
              />
            )}
          </View>

          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => {
                clearDashboardCache();
                clearDetailCache();
                dispatch(setLogout());
              }}>
              <MaterialIcons
                name="logout"
                color={APPCOLORS.WHITE}
                size={responsiveFontSize(3)}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop:
              Platform.OS === 'ios'
                ? responsiveHeight(1.5)
                : responsiveHeight(1),
            gap: 10,
          }}>
          <View
            style={{
              height: responsiveHeight(Platform.OS === 'ios' ? 6 : 5),
              width: responsiveHeight(Platform.OS === 'ios' ? 6 : 5),
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderRadius: 200,
              borderColor: APPCOLORS.WHITE,
            }}>
            <AppText
              title={userInitials}
              titleColor={APPCOLORS.WHITE}
              titleSize={2}
              titleWeight
            />
          </View>
          <View style={{flex: 1}}>
            <AppText
              title={userName}
              titleColor={APPCOLORS.WHITE}
              titleSize={Platform.OS === 'ios' ? 2.2 : 2.0}
              titleWeight
            />
            <AppText
              title={title}
              titleColor={APPCOLORS.WHITE}
              titleSize={Platform.OS === 'ios' ? 1.6 : 1.4}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 20,
    padding: 3,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  switcherBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switcherBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  switcherText: {
    color: '#E0F2FE',
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
  },
  switcherTextActive: {
    color: '#0784B5',
    fontWeight: 'bold',
  },
});

export default AppHeader;
