import React, { useRef, useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { CurrentLogin, setLoader } from '../../redux/AuthSlice';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../../utils/Responsive';
import AppText from '../../components/AppText';
import BaseUrl, { COMPANY_URLS } from '../../utils/BaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const { Loading: loading } = useSelector(state => state.Data);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('IBR-ENT');

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

    // Load persisted company
    AsyncStorage.getItem('SELECTED_COMPANY').then(company => {
      if (company === 'IBR-ENT' || company === 'FBPM') {
        setSelectedCompany(company);
        BaseUrl.set(COMPANY_URLS[company]);
      }
    });
  }, []);

  const handleCompanySelect = company => {
    setSelectedCompany(company);
    BaseUrl.set(COMPANY_URLS[company]);
    AsyncStorage.setItem('SELECTED_COMPANY', company);
  };

  const loginUser = () => {
    if (!username.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your username' });
      return;
    }
    if (!password.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your password' });
      return;
    }

    dispatch(setLoader(true));
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BaseUrl}users.php`,
      headers: {},
    };
    dispatch(CurrentLogin({ config, username, password }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Header Background */}
        <View
          style={{
            backgroundColor: '#0784B5',
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
              transform: [{ translateY: slideAnim }],
              paddingBottom: 64,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: responsiveFontSize(4),
                fontWeight: 'bold',
              }}>
              Fatima Board & Paper Mill Pvt
            </Text>
          </Animated.View>
        </View>

        {/* White Body Card */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginTop: -responsiveHeight(10),
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: responsiveWidth(8),
            paddingTop: responsiveHeight(5),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
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
              marginBottom: responsiveHeight(3),
            }}>
            <Ionicons
              name="person"
              size={responsiveFontSize(2.2)}
              color="#0784B5"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Enter your username"
              placeholderTextColor="#999"
              style={{
                flex: 1,
                color: '#000',
                paddingVertical: responsiveHeight(1),
                fontSize: responsiveFontSize(1.8),
              }}
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
              marginBottom: responsiveHeight(1.5),
            }}>
            <FontAwesome5
              name="key"
              size={responsiveFontSize(2.2)}
              color="#0784B5"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              style={{
                flex: 1,
                color: '#000',
                paddingVertical: responsiveHeight(1),
                fontSize: responsiveFontSize(1.8),
              }}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Company Selection */}
          <Text
            style={{
              color: '#0784B5',
              fontSize: responsiveFontSize(1.8),
              fontWeight: '600',
              marginTop: responsiveHeight(1.5),
              marginBottom: 8,
            }}>
            Select Company
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: '#F0F2F5',
              borderRadius: 25,
              padding: 4,
              marginBottom: responsiveHeight(1.5),
            }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleCompanySelect('IBR-ENT')}
              style={{
                flex: 1,
                backgroundColor: selectedCompany === 'IBR-ENT' ? '#0784B5' : 'transparent',
                borderRadius: 20,
                paddingVertical: responsiveHeight(1.2),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: selectedCompany === 'IBR-ENT' ? '#FFF' : '#666',
                  fontSize: responsiveFontSize(1.6),
                  fontWeight: 'bold',
                }}>
                IBR-ENT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleCompanySelect('FBPM')}
              style={{
                flex: 1,
                backgroundColor: selectedCompany === 'FBPM' ? '#0784B5' : 'transparent',
                borderRadius: 20,
                paddingVertical: responsiveHeight(1.2),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: selectedCompany === 'FBPM' ? '#FFF' : '#666',
                  fontSize: responsiveFontSize(1.6),
                  fontWeight: 'bold',
                }}>
                FBPM
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginBottom: responsiveHeight(3) }}
            onPress={() =>
              Toast.show({ type: 'info', text1: 'Forgot password coming soon' })
            }>
            <Text
              style={{
                color: '#0784B5',
                fontWeight: '500',
                fontSize: responsiveFontSize(1.6),
              }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <View
            style={{
              backgroundColor: '#0784B5',
              borderRadius: 30,
              overflow: 'hidden',
            }}>
            <TouchableOpacity
              onPress={loginUser}
              activeOpacity={0.8}
              disabled={loading}
              style={{
                paddingVertical: responsiveHeight(1.8),
                alignItems: 'center',
              }}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  style={{
                    color: 'white',
                    fontSize: responsiveFontSize(2.2),
                    fontWeight: 'bold',
                  }}>
                  SIGN IN
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: responsiveHeight(5) }}>
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
