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
import {useSelector} from 'react-redux';
import AppText from '../../components/AppText';
import AppHeader from '../../components/AppHeader';
import {APPCOLORS} from '../../utils/APPCOLORS';
import BaseUrl, {getActiveCompany} from '../../utils/BaseUrl';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive';
import AppDatePicker from '../../components/AppDatePicker';
import moment from 'moment';
import { GetIncomeAndExpense } from '../../global/ChartApisCall';

const decodeHtml = str => {
  if (!str) {
    return '';
  }
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
};

export const dashboardCache = {
  data: null,
  lastFetched: null,
};

export const clearDashboardCache = () => {
  dashboardCache.data = null;
  dashboardCache.lastFetched = null;
};

const Dashboard = ({navigation}) => {
  const {activeCompany} = useSelector(state => state.Data || {});
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

  const [fromDate, setFromDate] = useState(
    moment().startOf('month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [isIncomeLoading, setIsIncomeLoading] = useState(false);

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
    fetchIncomeExpense(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeCompany) {
      clearDashboardCache();
      getMoneyData();
      fetchIncomeExpense(fromDate, toDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany]);

  const fetchIncomeExpense = async (start = fromDate, end = toDate) => {
    setIsIncomeLoading(true);
    try {
      const res = await GetIncomeAndExpense(start, end);
      if (res) {
        if (
          res.status_income_det === 'true' ||
          res.status_income_det === true
        ) {
          setIncomeList(res.data_income_det || []);
        } else {
          setIncomeList([]);
        }
        if (res.status_exp_det === 'true' || res.status_exp_det === true) {
          setExpenseList(res.data_exp_det || []);
        } else {
          setExpenseList([]);
        }
      }
    } catch (err) {
      console.log('Dashboard fetchIncomeExpense error:', err);
    } finally {
      setIsIncomeLoading(false);
    }
  };

  const handleApplyDateFilter = () => {
    fetchIncomeExpense(fromDate, toDate);
  };

  const handleResetDateFilter = () => {
    const today = moment().format('YYYY-MM-DD');
    const prev = moment().startOf('month').format('YYYY-MM-DD');
    setFromDate(prev);
    setToDate(today);
    fetchIncomeExpense(prev, today);
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const totalIncome = incomeList.reduce((acc, item) => {
    const num = parseFloat(item.total || '0') || 0;
    return acc + Math.abs(num);
  }, 0);

  const totalExpense = expenseList.reduce((acc, item) => {
    const num = parseFloat(item.total || '0') || 0;
    return acc + Math.abs(num);
  }, 0);

  const netDifference = totalIncome - totalExpense;

  const getMoneyData = async () => {
    setLoader(true);
    try {
      const formData = new FormData();
      formData.append('company', getActiveCompany());
      const {data} = await axios.post(`${BaseUrl}dashboard_view.php`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
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
    {
      id: 104,
      title: 'Delivery Note',
      icon: 'barcode-scan',
      color: APPCOLORS.Primary || '#0784B5',
      description: 'Scan Barcodes & Manage Delivery Cart',
      onPress: () => navigation.navigate('DeliveryScreen'),
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollViewContent, {paddingTop: 12}]}>
        {loader && (
          <ActivityIndicator
            size="large"
            color={APPCOLORS.Primary}
            style={{marginBottom: 10}}
          />
        )}

        <View style={styles.filterCard}>
          <Text style={styles.filterCardTitle}>DATE FILTER</Text>
          <View style={styles.filterInputsRow}>
            <TouchableOpacity
              style={styles.dateBox}
              activeOpacity={0.75}
              onPress={() => setShowFromPicker(true)}>
              <Icon
                name="calendar"
                size={18}
                color={APPCOLORS.Primary || '#0784B5'}
              />
              <View style={styles.dateTextWrapper}>
                <Text style={styles.dateLabel}>FROM</Text>
                <Text style={styles.dateValueText}>
                  {fromDate ? moment(fromDate).format('DD/MM/YYYY') : ''}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dateArrowBox}>
              <Text style={styles.dateArrowText}>→</Text>
            </View>

            <TouchableOpacity
              style={styles.dateBox}
              activeOpacity={0.75}
              onPress={() => setShowToPicker(true)}>
              <Icon
                name="calendar"
                size={18}
                color={APPCOLORS.Primary || '#0784B5'}
              />
              <View style={styles.dateTextWrapper}>
                <Text style={styles.dateLabel}>TO</Text>
                <Text style={styles.dateValueText}>
                  {toDate ? moment(toDate).format('DD/MM/YYYY') : ''}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.filterButtonsRow}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApplyDateFilter}
              activeOpacity={0.8}>
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetDateFilter}
              activeOpacity={0.8}>
              <Text style={styles.resetBtnText}>Last 30 Days</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listSectionCard}>
          <View style={[styles.listHeaderRow, { borderBottomColor: '#10B981' }]}>
            <Text style={[styles.listSectionTitle, { color: '#059669' }]}>
              INCOME BREAKDOWN
            </Text>
            <Text style={[styles.listTotalText, { color: '#059669' }]}>
              Rs.{' '}
              {totalIncome.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {isIncomeLoading && incomeList.length === 0 ? (
            <View style={styles.listLoadingBox}>
              <ActivityIndicator size="small" color="#059669" />
            </View>
          ) : incomeList.length === 0 ? (
            <Text style={styles.noDataText}>No income records in this period.</Text>
          ) : (
            incomeList.map((item, idx) => {
              const amountNum = parseFloat(item.total || '0') || 0;
              const cleanName = decodeHtml(item.name || 'Income Account');

              return (
                <TouchableOpacity
                  key={`inc_${idx}`}
                  style={[
                    styles.accountRow,
                    idx < incomeList.length - 1 && styles.accountRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('AccountDetail', {
                      title: cleanName,
                      accountType:
                        item.account_type || item.type || item.id || '',
                      fromDate,
                      toDate,
                    })
                  }>
                  <View style={styles.accountRowLeft}>
                    <Text style={styles.accountTitle} numberOfLines={1}>
                      {cleanName}
                    </Text>
                    <Text style={styles.accountHint}>Tap for details ›</Text>
                  </View>
                  <Text style={[styles.accountAmount, { color: '#059669' }]}>
                    Rs.{' '}
                    {Math.abs(amountNum).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.listSectionCard}>
          <View style={[styles.listHeaderRow, { borderBottomColor: '#EF4444' }]}>
            <Text style={[styles.listSectionTitle, { color: '#DC2626' }]}>
              EXPENSE BREAKDOWN
            </Text>
            <Text style={[styles.listTotalText, { color: '#DC2626' }]}>
              Rs.{' '}
              {totalExpense.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {isIncomeLoading && expenseList.length === 0 ? (
            <View style={styles.listLoadingBox}>
              <ActivityIndicator size="small" color="#DC2626" />
            </View>
          ) : expenseList.length === 0 ? (
            <Text style={styles.noDataText}>No expense records in this period.</Text>
          ) : (
            expenseList.map((item, idx) => {
              const amountNum = parseFloat(item.total || '0') || 0;
              const cleanName = decodeHtml(item.name || 'Expense Account');

              return (
                <TouchableOpacity
                  key={`exp_${idx}`}
                  style={[
                    styles.accountRow,
                    idx < expenseList.length - 1 && styles.accountRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('AccountDetail', {
                      title: cleanName,
                      accountType:
                        item.account_type || item.type || item.id || '',
                      fromDate,
                      toDate,
                    })
                  }>
                  <View style={styles.accountRowLeft}>
                    <Text style={styles.accountTitle} numberOfLines={1}>
                      {cleanName}
                    </Text>
                    <Text style={styles.accountHint}>Tap for details ›</Text>
                  </View>
                  <Text style={[styles.accountAmount, { color: '#DC2626' }]}>
                    Rs.{' '}
                    {Math.abs(amountNum).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.netDiffCard}>
          <View style={styles.netDiffLeft}>
            <Text style={styles.netDiffLabel}>DIFFERENCE (INC - EXP)</Text>
            <Text
              style={[
                styles.netDiffValue,
                netDifference >= 0 ? styles.diffPositive : styles.diffNegative,
              ]}>
              Rs.{' '}
              {Math.abs(netDifference).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {netDifference < 0 ? ' (Loss)' : ' (Profit)'}
            </Text>
          </View>
          <View
            style={[
              styles.netDiffBadge,
              { backgroundColor: netDifference >= 0 ? '#ECFDF5' : '#FEF2F2' },
            ]}>
            <Text
              style={[
                styles.netDiffBadgeText,
                { color: netDifference >= 0 ? '#059669' : '#DC2626' },
              ]}>
              {netDifference >= 0 ? 'Surplus' : 'Deficit'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionDividerRow}>
          <Text style={styles.sectionDividerTitle}>FINANCIAL OVERVIEW</Text>
        </View>

        {revData.map((item, index) => renderCard(item, index))}

        <AppDatePicker
          visible={showFromPicker}
          value={new Date(fromDate)}
          title="Select From Date"
          onClose={() => setShowFromPicker(false)}
          onChange={selectedDate => {
            if (selectedDate) {
              setFromDate(moment(selectedDate).format('YYYY-MM-DD'));
            }
          }}
        />

        <AppDatePicker
          visible={showToPicker}
          value={new Date(toDate)}
          title="Select To Date"
          onClose={() => setShowToPicker(false)}
          onChange={selectedDate => {
            if (selectedDate) {
              setToDate(moment(selectedDate).format('YYYY-MM-DD'));
            }
          }}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {paddingBottom: responsiveHeight(5)},
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
  filterCard: {
    backgroundColor: '#FFFFFF',
    width: responsiveWidth(94),
    alignSelf: 'center',
    marginTop: 6,
    padding: responsiveWidth(3.5),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  filterCardTitle: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  filterInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F2',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    paddingHorizontal: 8,
    gap: 8,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 0.5,
  },
  dateValueText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
    color: APPCOLORS.BLACK,
  },
  dateArrowBox: {
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(1.5),
    fontWeight: 'bold',
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#EAE6E1',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#333',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
  },
  listSectionCard: {
    backgroundColor: '#FFFFFF',
    width: responsiveWidth(94),
    alignSelf: 'center',
    marginTop: responsiveHeight(1.5),
    padding: responsiveWidth(3.5),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    marginBottom: 4,
  },
  listSectionTitle: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  listTotalText: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: 'bold',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accountRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2ED',
  },
  accountRowLeft: {
    flex: 1,
    marginRight: 10,
  },
  accountTitle: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
    color: APPCOLORS.BLACK,
  },
  accountHint: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  accountAmount: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: 'bold',
  },
  listLoadingBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: responsiveFontSize(1.4),
    color: '#888',
    paddingVertical: 14,
    textAlign: 'center',
  },
  netDiffCard: {
    backgroundColor: '#FFFFFF',
    width: responsiveWidth(94),
    alignSelf: 'center',
    marginTop: responsiveHeight(1.5),
    padding: responsiveWidth(3.5),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  netDiffLeft: {
    flex: 1,
  },
  netDiffLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 0.5,
  },
  netDiffValue: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: 'bold',
    marginTop: 2,
  },
  diffPositive: {
    color: '#059669',
  },
  diffNegative: {
    color: '#DC2626',
  },
  netDiffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  netDiffBadgeText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: 'bold',
  },
  sectionDividerRow: {
    width: responsiveWidth(94),
    alignSelf: 'center',
    marginTop: responsiveHeight(2.5),
    marginBottom: responsiveHeight(1),
  },
  sectionDividerTitle: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 0.5,
  },
});

export default Dashboard;

