import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import {CurrentLogin, setLoader} from '../../redux/AuthSlice';
import {responsiveFontSize, responsiveHeight} from '../../utils/Responsive';
import AppText from '../../components/AppText';
import BaseUrl from '../../utils/BaseUrl';

const Login = ({navigation}) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loginUser = () => {
    if (!username.trim()) {
      Toast.show({type: 'error', text1: 'Please enter your username'});
      return;
    }
    if (!password.trim()) {
      Toast.show({type: 'error', text1: 'Please enter your password'});
      return;
    }

    dispatch(setLoader(true));
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BaseUrl}users.php`,
      headers: {},
    };
    dispatch(CurrentLogin({config, username, password}));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1, backgroundColor: '#fff'}}>
        {/* Gradient Header */}
        <LinearGradient
          colors={['#0784B5', '#9BD4E4']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{
            height: responsiveHeight(45),
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            paddingHorizontal: 30,
            justifyContent: 'flex-end',
            paddingBottom: 50,
          }}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: responsiveFontSize(4),
                fontWeight: 'bold',
              }}>
              Fatima Board And Paper Mill PVT
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: responsiveFontSize(3),
                marginTop: 5,
              }}>
              Sign in!
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* White Body Card */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginTop: -responsiveHeight(10),
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: 30,
            paddingTop: 40,
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          }}>
          {/* Username Input */}
          <Text
            style={{
              color: '#0784B5',
              fontSize: responsiveFontSize(1.8),
              fontWeight: '600',
              marginBottom: 5,
            }}>
            Username
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderColor: '#CCC',
              marginBottom: 25,
            }}>
            <Ionicons
              name="person"
              size={responsiveFontSize(2.2)}
              color="#0784B5"
              style={{marginRight: 10}}
            />
            <TextInput
              placeholder="Enter your username"
              placeholderTextColor="#999"
              style={{flex: 1, color: '#000', paddingVertical: 8}}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Password Input */}
          <Text
            style={{
              color: '#0784B5',
              fontSize: responsiveFontSize(1.8),
              fontWeight: '600',
              marginBottom: 5,
            }}>
            Password
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderColor: '#CCC',
              marginBottom: 10,
            }}>
            <FontAwesome5
              name="key"
              size={responsiveFontSize(2.2)}
              color="#0784B5"
              style={{marginRight: 10}}
            />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              style={{flex: 1, color: '#000', paddingVertical: 8}}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={{alignSelf: 'flex-end', marginBottom: 25}}
            onPress={() =>
              Toast.show({type: 'info', text1: 'Forgot password coming soon'})
            }>
            <Text style={{color: '#0784B5', fontWeight: '500'}}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <LinearGradient
            colors={['#0784B5', '#46BEE8']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={{
              borderRadius: 30,
              overflow: 'hidden',
            }}>
            <TouchableOpacity
              onPress={loginUser}
              style={{
                paddingVertical: 14,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: responsiveFontSize(2.2),
                  fontWeight: 'bold',
                }}>
                SIGN IN
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Footer */}
          <View style={{alignItems: 'center', marginTop: 40}}>
            <AppText
              title="Powered by DeSolution"
              titleSize={1.5}
              titleColor="#999"
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Login;
