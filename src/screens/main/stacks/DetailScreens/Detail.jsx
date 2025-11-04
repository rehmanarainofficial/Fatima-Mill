import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import SimpleHeader from '../../../../components/SimpleHeader';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import {responsiveWidth} from '../../../../utils/Responsive';
import BaseUrl from '../../../../utils/BaseUrl';
import axios from 'axios';
import Animated, {FadeInUp} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Detail = ({navigation}) => {
  const [slider_data, setslider_data] = useState();
  const [AllData, setAllData] = useState();
  const [loader, setLoader] = useState(false);

  const formatNumber = num => {
    if (num === undefined || num === null) return '-';
    return Number(num).toLocaleString('en-US', {
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
  ];
  useEffect(() => {
    if (!slider_data) {
      getMoneyData();
    }
  }, []);

  const getMoneyData = async () => {
    setLoader(true);
    try {
      const {data} = await axios.get(`${BaseUrl}dashboard_view.php`);
      setslider_data(data?.slider_data);
      setAllData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  const renderItem = ({item, index}) => (
    <Animated.View
      entering={FadeInUp.delay(index * 120).duration(600)}
      style={{
        width: responsiveWidth(92),
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: {width: 0, height: 3},
        shadowRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 14,
        borderLeftWidth: 5,
        borderLeftColor: item.color,
      }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('MoreDetail', {
            slider_data: AllData,
            selectedItem: item.title,
          })
        }>
        {/* 🔹 Title + Icon */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
          }}>
          <Icon
            name={item.icon}
            size={22}
            color={item.color}
            style={{marginRight: 8}}
          />
          <Text
            style={{
              fontWeight: '700',
              fontSize: 15,
              color: APPCOLORS.BLACK,
            }}>
            {item.title}
          </Text>
        </View>

        {/* 🔹 Thin separator under heading */}
        <View
          style={{
            height: 1,
            backgroundColor: '#E0E0E0',
            width: '65%',
            alignSelf: 'flex-start',
            marginBottom: 8,
          }}
        />

        {/* 🔸 Values section */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
          }}>
          {/* Current Month */}
          <View style={{alignItems: 'flex-start'}}>
            <Text style={{fontSize: 12, color: '#888'}}>Current Month</Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: APPCOLORS.BLACK,
                marginTop: 2,
              }}>
              {formatNumber(item.Amount)}
            </Text>
          </View>

          {/* Previous Month */}
          <View style={{alignItems: 'flex-end'}}>
            <Text style={{fontSize: 12, color: '#888'}}>Previous Month</Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: APPCOLORS.BLACK,
                marginTop: 2,
              }}>
              {formatNumber(item.Prev_Amount)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loader) {
    // 🔹 Show loader when data is being fetched
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: APPCOLORS.WHITE,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color={APPCOLORS.Primary} />
        <Text style={{marginTop: 10, color: '#555'}}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: APPCOLORS.WHITE}}>
      <SimpleHeader title="Detail" />

      <FlatList
        data={revData}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100,
        }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

export default Detail;
