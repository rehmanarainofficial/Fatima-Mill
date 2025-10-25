import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Text, // 💡 NEW: Native Text component imported for custom heading
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInLeft,
} from 'react-native-reanimated';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import moment from 'moment';
import AppText from '../../components/AppText';
import AppHeader from '../../components/AppHeader';
import {APPCOLORS} from '../../utils/APPCOLORS';
import BaseUrl from '../../utils/BaseUrl';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive';

// 💡 Custom Animated Card Component (Functional version)
const ScaleCard = ({children, onPress}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {damping: 8, stiffness: 100});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 8, stiffness: 100});
  };

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardTouchArea}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const Dashboard = ({navigation}) => {
  const [visible, setVisible] = useState(false);
  const [AllData, setAllData] = useState();
  const [Type, setType] = useState();
  const [loader, setLoader] = useState(false);

  const companyData = [
    {
      id: 1,
      name: 'IBR-ENT',
      icon: (
        <MaterialIcons
          name="account-balance"
          size={responsiveFontSize(4)}
          color={APPCOLORS.Primary}
        />
      ),
      onPress: () => navigation.navigate('Detail', {type: 'Sales'}),
    },
    {
      id: 2,
      name: 'FBPM',
      icon: (
        <MaterialIcons
          name="account-balance"
          size={responsiveFontSize(4)}
          color={APPCOLORS.Primary}
        />
      ),
      onPress: () => navigation.navigate('Detail', {type: 'Purchase'}),
    },
    {
      id: 3,
      name: 'Company3',
      icon: (
        <MaterialIcons
          name="account-balance"
          size={responsiveFontSize(4)}
          color={APPCOLORS.Primary}
        />
      ),
      onPress: () => navigation.navigate('Detail', {type: 'Accounts'}),
    },
    {
      id: 4,
      name: 'Company4',
      icon: (
        <MaterialIcons
          name="account-balance"
          size={responsiveFontSize(4)}
          color={APPCOLORS.Primary}
        />
      ),
      onPress: () => navigation.navigate('Detail', {type: 'Inventory'}),
    },
  ];
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getMoneyData();
    });
    return unsubscribe;
  }, [navigation]);

  const getMoneyData = async () => {
    setLoader(true);
    const todayDate = moment(new Date()).format('YYYY-MM-DD');
    try {
      const {data} = await axios.get(`${BaseUrl}dashboard_view.php`, {
        headers: {'content-type': 'multipart/form-data'},
        params: {current_date: todayDate, pre_month_date: '2025-04-19'},
      });
      setAllData(data);
    } catch (error) {
      console.error('❌ Dashboard API Error:', error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <LinearGradient colors={['#e8f3f8', '#ffffff']} style={{flex: 1}}>
      {/* 🔹 Header */}
      <Animated.View entering={FadeInDown.duration(600)}>
        <AppHeader
          title={'Dashboard'}
          onPress={res => {
            setVisible(true);
            setType(res);
          }}
        />
      </Animated.View>

      {/* 🔹 Modal (Unchanged) */}
      <Modal
        isVisible={visible}
        animationIn="slideInUp"
        animationOut="fadeOutDown"
        backdropTransitionOutTiming={0}
        onBackdropPress={() => setVisible(false)}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1D4452', '#4199B8']}
            style={styles.modalHeaderGradient}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <AntDesign
                name="close"
                color={APPCOLORS.WHITE}
                size={responsiveFontSize(2.2)}
              />
            </TouchableOpacity>

            <AppText
              title={
                Type === 'bell'
                  ? 'Outstanding Receipt'
                  : Type === 'mail'
                  ? 'Outstanding Payment'
                  : Type === 'chat'
                  ? 'Outstanding Cheque'
                  : 'Dashboard'
              }
              titleColor={APPCOLORS.WHITE}
              titleSize={2}
              titleWeight
            />
            <View />
          </LinearGradient>
        </View>
      </Modal>

      {/* 💡 Solution: ScrollView to wrap main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {/* 🔹 Loader */}
        {loader && (
          <ActivityIndicator
            size="large"
            color={APPCOLORS.Primary}
            style={{marginTop: 30}}
          />
        )}

        {/* 🔹 Animated Cards (Grid View) */}
        <View style={styles.cardGridContainer}>
          <View style={styles.gridRow}>
            {companyData.slice(0, 2).map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(index * 120).duration(700)}>
                <ScaleCard onPress={item.onPress}>
                  <View style={styles.cardInnerView}>
                    {item.icon}
                    {/* AppText used here as required for card titles */}
                    <AppText
                      title={item.name}
                      titleColor={APPCOLORS.BLACK}
                      titleWeight
                      titleSize={2}
                    />
                  </View>
                </ScaleCard>
              </Animated.View>
            ))}
          </View>
          <View style={styles.gridRow}>
            {companyData.slice(2, 4).map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay((index + 2) * 120).duration(700)}>
                <ScaleCard onPress={item.onPress}>
                  <View style={styles.cardInnerView}>
                    {item.icon}
                    {/* AppText used here as required for card titles */}
                    <AppText
                      title={item.name}
                      titleColor={APPCOLORS.BLACK}
                      titleWeight
                      titleSize={2}
                    />
                  </View>
                </ScaleCard>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* 🔹 Info Banner Slider (Horizontal FlatList) */}
        <Animated.View entering={FadeInLeft.delay(800).duration(1000)}>
          {/* 💡 CHANGE 1: AppText removed, native Text component used for custom heading */}
          <Text style={styles.updateHeading}>
            <Text style={{fontWeight: 'bold'}}>Latest</Text> Updates
          </Text>
          {/* 💡 CHANGE 2: Horizontal FlatList's wrapper view now has top margin from the heading style */}
          <FlatList
            data={[1, 2, 3]}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.infoBannerContainer}
            renderItem={() => (
              <LinearGradient
                colors={['#4199B8', APPCOLORS.Primary]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.infoBannerGradient}>
                {/* AppText used here as required for banner content */}
                <AppText
                  title="🎉 New Feature Release"
                  titleColor={APPCOLORS.WHITE}
                  titleSize={2}
                  titleWeight
                />
                <View style={{width: responsiveWidth(60), marginTop: 8}}>
                  <AppText
                    title='Inventory tracking has been enhanced! Check it out under the "Warehouse" module.'
                    titleColor={APPCOLORS.WHITE}
                    titleSize={1.7}
                  />
                </View>
              </LinearGradient>
            )}
          />
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 20,
  },
  cardGridContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: responsiveWidth(42),
    height: responsiveHeight(18),
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  cardTouchArea: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInnerView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },
  // 💡 NEW STYLE for the custom heading
  updateHeading: {
    fontSize: responsiveFontSize(2.2), // Same size as previous AppText
    color: APPCOLORS.BLACK,
    // Margin for spacing: Top margin for spacing below the main cards.
    marginTop: responsiveHeight(3),
    marginBottom: 10,
    paddingHorizontal: 20, // Alignment with other content
  },
  infoBannerContainer: {
    gap: 20,
    paddingLeft: 20,
    paddingBottom: 10,
  },
  infoBannerGradient: {
    height: responsiveHeight(18),
    width: responsiveWidth(80),
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
  },
  modalContent: {
    height: responsiveHeight(65),
    width: responsiveWidth(90),
    backgroundColor: APPCOLORS.WHITE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default Dashboard;
