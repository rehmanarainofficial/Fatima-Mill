import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeInUp, FadeInDown} from 'react-native-reanimated';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

const dashboardCache = {
  data: null,
  lastFetched: null,
};

export const clearDashboardCache = () => {
  dashboardCache.data = null;
  dashboardCache.lastFetched = null;
};

const Dashboard = ({navigation}) => {
  const [visible, setVisible] = useState(false);
  const [Type, setType] = useState();
  const [loader, setLoader] = useState(!dashboardCache.data);
  const [slider_data, setslider_data] = useState(
    dashboardCache.data?.slider_data || null,
  );
  const [today_data, settoday_data] = useState(
    dashboardCache.data?.today_data || null,
  );
  const [AllData, setAllData] = useState(dashboardCache.data || null);

  useEffect(() => {
    if (!dashboardCache.data) {
      getMoneyData();
    } else {
      if (!slider_data) {
        setslider_data(dashboardCache.data?.slider_data);
        settoday_data(dashboardCache.data?.today_data);
        setAllData(dashboardCache.data);
      }
    }
  }, []);

  const getMoneyData = async () => {
    setLoader(true);
    try {
      const {data} = await axios.get(`${BaseUrl}dashboard_view.php`);
      dashboardCache.data = data;
      dashboardCache.lastFetched = Date.now();
      setslider_data(data?.slider_data);
      settoday_data(data?.today_data);
      setAllData(data);
    } catch (error) {
      console.error('Dashboard API Error:', error);
    } finally {
      setLoader(false);
    }
  };

  const formatValue = (val, isInteger = false) => {
    if (val === undefined || val === null) {
      return '-';
    }
    const parsed = Number(val);
    if (isNaN(parsed)) {
      return val;
    }
    if (isInteger || (parsed % 1 === 0 && parsed < 1000)) {
      return parsed.toString();
    }
    return parsed.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const revData = [
    {
      id: 7,
      title: 'Bank & Cash',
      icon: 'bank',
      color: '#4CAF50',
      Amount: slider_data?.cur_m_bank,
      Prev_Amount: slider_data?.pre_m_bank,
    },
    {
      id: 8,
      title: 'Receivable',
      icon: 'cash-multiple',
      color: '#03A9F4',
      Amount: slider_data?.cur_m_receivable,
      Prev_Amount: slider_data?.pre_m_receivable,
    },
    {
      id: 14,
      title: 'Inventory Valuation',
      icon: 'warehouse',
      color: '#FF9800',
      Amount: slider_data?.cur_m_inventory_val,
      Prev_Amount: slider_data?.pre_m_inventory_val,
    },
    {
      id: 9,
      title: 'Payable',
      icon: 'credit-card-outline',
      color: '#E91E63',
      Amount: slider_data?.cur_m_payable,
      Prev_Amount: slider_data?.pre_m_payable,
    },
    {
      id: 4,
      title: 'Equity',
      icon: 'account-cash-outline',
      color: '#673AB7',
      Amount: slider_data?.cur_m_equity,
      Prev_Amount: slider_data?.pre_m_equity,
    },
    {
      id: 1,
      title: 'Income',
      icon: 'chart-line',
      color: '#009688',
      Amount: slider_data?.cur_m_income,
      Prev_Amount: slider_data?.pre_m_income,
    },
    {
      id: 2,
      title: 'Expense',
      icon: 'cash-minus',
      color: '#F44336',
      Amount: slider_data?.cur_m_expense,
      Prev_Amount: slider_data?.pre_m_expense,
    },
    {
      id: 3,
      title: 'Revenue',
      icon: 'trending-up',
      color: '#2196F3',
      Amount: slider_data?.cur_m_revenue,
      Prev_Amount: slider_data?.pre_m_revenue,
    },
    {
      id: 102,
      title: 'Delivery',
      icon: 'truck-delivery-outline',
      color: '#795548',
      Amount: today_data?.today_return,
      Prev_Amount: today_data?.today_recovery,
      leftLabel: "Today's Return",
      rightLabel: "Today's Recovery",
      onPress: () => navigation.navigate('DeliveryScreen'),
    },
    {
      id: 103,
      title: 'Daily Activities',
      icon: 'calendar',
      color: '#D32F2F',
      description: 'Today Sales and Orders',
      onPress: () => navigation.navigate('VoidTransactions'),
    },
  ];

  const renderCard = (item, index) => {
    const leftLabel = item.leftLabel || 'Current Month';
    const rightLabel = item.rightLabel || 'Previous Month';

    return (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 80).duration(500)}
        style={{
          width: responsiveWidth(94),
          alignSelf: 'center',
          backgroundColor: '#fff',
          borderRadius: 14,
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowOffset: {width: 0, height: 3},
          shadowRadius: 5,
          paddingVertical: responsiveHeight(1.5),
          paddingHorizontal: responsiveWidth(4),
          marginBottom: responsiveHeight(1.5),
          borderLeftWidth: 5,
          borderLeftColor: item.color,
        }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (item.onPress) {
              item.onPress();
            } else {
              navigation.navigate('MoreDetail', {
                slider_data: AllData,
                selectedItem: item.title,
              });
            }
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 6,
            }}>
            <Icon
              name={item.icon}
              size={responsiveFontSize(2.5)}
              color={item.color}
              style={{marginRight: 8}}
            />
            <Text
              style={{
                fontWeight: '700',
                fontSize: responsiveFontSize(1.8),
                color: APPCOLORS.BLACK,
              }}>
              {item.title}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: '#E0E0E0',
              width: '65%',
              alignSelf: 'flex-start',
              marginBottom: responsiveHeight(1),
            }}
          />

          {item.description ? (
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: '#666',
                marginTop: 4,
              }}>
              {item.description}
            </Text>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 4,
              }}>
              <View style={{alignItems: 'flex-start'}}>
                <Text
                  style={{fontSize: responsiveFontSize(1.5), color: '#888'}}>
                  {leftLabel}
                </Text>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.8),
                    fontWeight: '600',
                    color: APPCOLORS.BLACK,
                    marginTop: 2,
                  }}>
                  {formatValue(item.Amount)}
                </Text>
              </View>

              <View style={{alignItems: 'flex-end'}}>
                <Text
                  style={{fontSize: responsiveFontSize(1.5), color: '#888'}}>
                  {rightLabel}
                </Text>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.8),
                    fontWeight: '600',
                    color: APPCOLORS.BLACK,
                    marginTop: 2,
                  }}>
                  {formatValue(item.Prev_Amount, item.isIntegerRight)}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#e8f3f8', '#ffffff']} style={{flex: 1}}>
      {/* 🔹 Header */}
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={{width: '100%'}}>
        <AppHeader
          title={'Dashboard'}
          onPress={res => {
            setVisible(true);
            setType(res);
          }}
        />
      </Animated.View>

      {/* 🔹 Modal */}
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

          {/* 🔹 Modal Body Content */}
          <ScrollView style={styles.modalBody}>
            <View style={styles.modalContentContainer}>
              <AppText
                title={`This is ${Type} content`}
                titleColor={APPCOLORS.BLACK}
                titleSize={1.8}
                style={styles.modalText}
              />
              <View style={styles.sampleDataContainer}>
                <AppText
                  title="Sample data will be displayed here based on the selected type."
                  titleColor={APPCOLORS.GRAY}
                  titleSize={1.6}
                  style={styles.sampleText}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 🔹 Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollViewContent, {paddingTop: 20}]}>
        {loader && (
          <ActivityIndicator
            size="large"
            color={APPCOLORS.Primary}
            style={{marginBottom: 20}}
          />
        )}

        {revData.map((item, index) => renderCard(item, index))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {paddingBottom: responsiveHeight(3)},
  modalContent: {
    height: responsiveHeight(65),
    width: responsiveWidth(90),
    backgroundColor: APPCOLORS.WHITE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    padding: responsiveWidth(4.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
    padding: responsiveWidth(4),
  },
  modalContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
  },
  sampleDataContainer: {
    padding: responsiveWidth(5),
    backgroundColor: APPCOLORS.LIGHT_GRAY,
    borderRadius: 10,
    marginTop: responsiveHeight(1),
  },
  sampleText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Dashboard;
