import {View, TouchableOpacity, Animated} from 'react-native';
import React, {useRef, useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {responsiveFontSize, responsiveHeight} from '../utils/Responsive';
import {APPCOLORS} from '../utils/APPCOLORS';
import AppText from './AppText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch} from 'react-redux';
import {setLogout} from '../redux/AuthSlice';

const AppHeader = ({title, onPress}) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{opacity: fadeAnim}}>
      <LinearGradient
        colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{
          height: responsiveHeight(25),
          borderBottomRightRadius: 25,
          borderBottomLeftRadius: 25,
          paddingHorizontal: 20,
          paddingTop: 35,
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
            <TouchableOpacity onPress={() => dispatch(setLogout())}>
              <MaterialIcons
                name="logout"
                color={APPCOLORS.WHITE}
                size={responsiveFontSize(2.5)}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 25,
            gap: 10,
          }}>
          <View
            style={{
              height: responsiveHeight(5),
              width: responsiveHeight(5),
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderRadius: 200,
              borderColor: APPCOLORS.WHITE,
            }}>
            <AppText title="MA" titleColor={APPCOLORS.WHITE} />
          </View>
          <View>
            <AppText
              title="Muhammad Anas"
              titleColor={APPCOLORS.WHITE}
              titleSize={2.2}
              titleWeight
            />
            <AppText
              title={title}
              titleColor={APPCOLORS.WHITE}
              titleSize={1.6}
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default AppHeader;
