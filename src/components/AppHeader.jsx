import {
  View,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
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
import {setLogout} from '../redux/AuthSlice';
import {clearDashboardCache} from '../screens/main/Dashboard';
import {clearDetailCache} from '../screens/main/stacks/DetailScreens/Detail';

const AppHeader = ({title, onPress}) => {
  const {currentData} = useSelector(state => state.Data);
  console.log('auth', currentData);

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
  }, []);

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
          <AppText
            title="DeSolutions"
            titleColor={APPCOLORS.WHITE}
            titleSize={3}
            titleWeight
          />

          {/* 🔹 Only Logout Icon Remaining - Other 4 icons removed */}
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

        {/* Profile Info */}
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
            <AppText title="MA" titleColor={APPCOLORS.WHITE} titleSize={2} />
          </View>
          <View>
            <AppText
              title={currentData?.real_name}
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

export default AppHeader;
