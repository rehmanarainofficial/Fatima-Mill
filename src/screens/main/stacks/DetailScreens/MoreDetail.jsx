import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import PieChart from 'react-native-pie-chart';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../../../components/AppText';
import NameBalanceContainer from '../../../../components/NameBalanceContainer';
import ViewAll from '../../../../components/ViewAll';
import Header from '../../../../components/Header';
import {
  GetBankBalance,
  GetSalesman,
  GetItemBalance,
  GetPayable,
  GetReceivable,
  GetIncomeAndExpenseDetail,
} from '../../../../global/ChartApisCall';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';

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

const MoreDetail = ({navigation, route}) => {
  const {selectedItem} = route.params;
  const isIncomeOrExpense = selectedItem === 'Income' || selectedItem === 'Expense';

  const cachedData = useRef({});

  const [activeData, setActiveData] = useState(null);
  const [activeChartData, setActiveChartData] = useState(null);
  const [loader, setLoader] = useState(false);

  // Date filters for Income and Expense (default 1 month range)
  const [fromDate, setFromDate] = useState(
    moment().subtract(1, 'month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const colors = [
    '#910000',
    '#00FF26',
    '#FF704D',
    '#DA0000',
    '#FF9168',
    '#FF5234',
    '#AD5959',
    '#ABCD12',
    '#910000',
    '#FFAA00',
  ];

  useEffect(() => {
    if (selectedItem) {
      if (!isIncomeOrExpense && cachedData.current[selectedItem]) {
        setActiveData(cachedData.current[selectedItem].data);
        setActiveChartData(cachedData.current[selectedItem].chart);
      } else {
        loadSpecificData(selectedItem, fromDate, toDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const loadSpecificData = async (itemType, fDate = fromDate, tDate = toDate) => {
    setLoader(true);
    try {
      let data, chart;

      switch (itemType) {
        case 'Bank & Cash':
          data = await GetBankBalance();
          chart = data?.data_bank_bal?.map((item, index) => ({
            value: Math.max(5, parseFloat(Math.round(item.bank_balance))),
            color: colors[index % colors.length],
          }));
          break;

        case 'Receivable':
          data = await GetReceivable();
          chart = data?.data_cust_bal?.map((item, index) => ({
            value: Math.max(5, parseFloat(Math.round(item.Balance))),
            color: colors[index % colors.length],
          }));
          break;

        case 'Payable':
          data = await GetPayable();
          chart = data?.data_supp_bal?.map((item, index) => ({
            value: Math.max(5, parseFloat(Math.round(item.Balance))),
            color: colors[index % colors.length],
          }));
          break;

        case 'Inventory Valuation':
          data = await GetItemBalance();
          chart = data?.data_item_bal?.map((item, index) => ({
            value: Math.max(5, parseFloat(Math.round(item.total))),
            color: colors[index % colors.length],
          }));
          break;

        case 'Salesman':
          data = await GetSalesman();
          chart = data?.data_salesman_bal?.map((item, index) => ({
            value: Math.max(5, parseFloat(Math.round(item.Balance))),
            color: colors[index % colors.length],
          }));
          break;

        case 'Income': {
          data = await GetIncomeAndExpenseDetail(fDate, tDate);
          const incomeList = data?.data_income_det || [];
          chart = incomeList.map((item, index) => ({
            value: Math.max(1, parseFloat(item.total) || 0),
            color: colors[index % colors.length],
          }));
          break;
        }

        case 'Expense': {
          data = await GetIncomeAndExpenseDetail(fDate, tDate);
          const expList = data?.data_exp_det || [];
          chart = expList.map((item, index) => ({
            value: Math.max(1, parseFloat(item.total) || 0),
            color: colors[index % colors.length],
          }));
          break;
        }

        default:
          console.log('Unknown item type:', itemType);
      }

      if (!isIncomeOrExpense) {
        cachedData.current[itemType] = {data, chart};
      }

      setActiveData(data);
      setActiveChartData(chart);
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      const formatted = moment(selectedDate).format('YYYY-MM-DD');
      setFromDate(formatted);
      if (isIncomeOrExpense) {
        loadSpecificData(selectedItem, formatted, toDate);
      }
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      const formatted = moment(selectedDate).format('YYYY-MM-DD');
      setToDate(formatted);
      if (isIncomeOrExpense) {
        loadSpecificData(selectedItem, fromDate, formatted);
      }
    }
  };

  const handleResetDates = () => {
    const defaultFrom = moment().subtract(1, 'month').format('YYYY-MM-DD');
    const defaultTo = moment().format('YYYY-MM-DD');
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    loadSpecificData(selectedItem, defaultFrom, defaultTo);
  };

  const renderRightElement = () => (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      {selectedItem === 'Inventory Valuation' ? (
        <>
          {/* All Movements Icon */}
          <TouchableOpacity
            style={{padding: 8, marginLeft: 10}}
            onPress={() =>
              navigation.navigate('StockMovements', {fromAllMovements: true})
            }>
            <MaterialIcons
              name="swap-horiz"
              size={responsiveFontSize(3)}
              color="white"
            />
          </TouchableOpacity>

          {/* Stock Sheet Icon */}
          <TouchableOpacity
            style={{padding: 8, marginLeft: 10}}
            onPress={() => navigation.navigate('StockSheetScreen')}>
            <MaterialIcons
              name="inventory"
              size={responsiveFontSize(3)}
              color="white"
            />
          </TouchableOpacity>
        </>
      ) : isIncomeOrExpense ? (
        <TouchableOpacity
          style={{padding: 8, marginLeft: 10}}
          onPress={() => loadSpecificData(selectedItem, fromDate, toDate)}>
          <MaterialIcons
            name="refresh"
            size={responsiveFontSize(3)}
            color="white"
          />
        </TouchableOpacity>
      ) : (
        /* Default Ledger Icon */
        <TouchableOpacity
          style={{padding: 8, marginLeft: 10}}
          onPress={() => navigation.navigate('ViewLedger')}>
          <MaterialIcons
            name="assignment"
            size={responsiveFontSize(3)}
            color="white"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDateFilter = () => {
    if (!isIncomeOrExpense) {
      return null;
    }

    return (
      <View style={styles.filterCard}>
        <View style={styles.dateRow}>
          {/* From Date */}
          <View style={styles.dateColumn}>
            <Text style={styles.dateLabel}>From Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              activeOpacity={0.8}
              onPress={() => setShowFromDatePicker(true)}>
              <MaterialIcons
                name="calendar-today"
                size={responsiveFontSize(2)}
                color={APPCOLORS.Primary || '#1565C0'}
                style={{marginRight: 6}}
              />
              <Text style={styles.dateText}>{fromDate}</Text>
            </TouchableOpacity>
          </View>

          {/* To Date */}
          <View style={styles.dateColumn}>
            <Text style={styles.dateLabel}>To Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              activeOpacity={0.8}
              onPress={() => setShowToDatePicker(true)}>
              <MaterialIcons
                name="calendar-today"
                size={responsiveFontSize(2)}
                color={APPCOLORS.Primary || '#1565C0'}
                style={{marginRight: 6}}
              />
              <Text style={styles.dateText}>{toDate}</Text>
            </TouchableOpacity>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.8}
            onPress={handleResetDates}>
            <MaterialIcons
              name="refresh"
              size={responsiveFontSize(2.6)}
              color={APPCOLORS.Primary || '#1565C0'}
            />
          </TouchableOpacity>
        </View>

        {showFromDatePicker && (
          <DateTimePicker
            value={new Date(fromDate)}
            mode="date"
            display="default"
            onChange={onFromDateChange}
          />
        )}

        {showToDatePicker && (
          <DateTimePicker
            value={new Date(toDate)}
            mode="date"
            display="default"
            onChange={onToDateChange}
          />
        )}
      </View>
    );
  };

  // Data ko render karne ke liye helper functions
  const renderChart = () => {
    const hasChartData =
      activeChartData &&
      activeChartData.length > 0 &&
      activeChartData.some(item => parseFloat(item.value) > 0);

    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: responsiveHeight(2),
        }}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <AppText title={selectedItem} titleSize={2} titleWeight />
        </View>
        {hasChartData && (
          <PieChart
            widthAndHeight={responsiveWidth(60)}
            series={activeChartData}
            cover={0.7}
            style={{alignSelf: 'center'}}
          />
        )}
      </View>
    );
  };

  const renderItem = ({item, index}) => {
    let name = '';
    let balance = '';

    switch (selectedItem) {
      case 'Bank & Cash':
        name = item?.bank_name;
        balance = item?.bank_balance;
        break;
      case 'Receivable':
        name = item?.name;
        balance = item?.Balance;
        break;
      case 'Payable':
        name = item?.supp_name;
        balance = item?.Balance;
        break;
      case 'Inventory Valuation':
        name = item?.description;
        balance = item?.total;
        break;
      case 'Salesman':
        name = item?.salesman_name;
        balance = item?.Balance;
        break;
      case 'Income':
      case 'Expense':
        name = decodeHtml(item?.name);
        balance = item?.total;
        break;
      default:
        name = 'N/A';
        balance = '0';
    }

    return (
      <NameBalanceContainer
        Name={name}
        balance={balance}
        item={item}
        type={selectedItem}
        index={index}
      />
    );
  };

  const getData = () => {
    switch (selectedItem) {
      case 'Bank & Cash':
        return activeData?.data_bank_bal || [];
      case 'Receivable':
        return activeData?.data_cust_bal || [];
      case 'Payable':
        return activeData?.data_supp_bal || [];
      case 'Inventory Valuation':
        return activeData?.data_item_bal || [];
      case 'Salesman':
        return activeData?.data_salesman_bal || [];
      case 'Income':
        return activeData?.data_income_det || [];
      case 'Expense':
        return activeData?.data_exp_det || [];
      default:
        return [];
    }
  };

  const getViewAllData = () => {
    switch (selectedItem) {
      case 'Bank & Cash':
        return activeData?.data_bank_bal_view_all || [];
      case 'Receivable':
        return activeData?.data_view_cust_bal || [];
      case 'Payable':
        return activeData?.data_supp_bal_view_all || [];
      case 'Inventory Valuation':
        return activeData?.data_item_bal_view_all || [];
      case 'Salesman':
        return activeData?.data_salesman_bal_view_all || [];
      default:
        return [];
    }
  };

  const getDataName = () => {
    switch (selectedItem) {
      case 'Bank & Cash':
        return 'Bank';
      case 'Receivable':
        return 'Receivable';
      case 'Payable':
        return 'Payable';
      case 'Inventory Valuation':
        return 'item';
      case 'Salesman':
        return 'salesman';
      default:
        return '';
    }
  };

  const ListHeaderComponent = () => (
    <View>
      {renderDateFilter()}
      {renderChart()}

      <View style={styles.headerContainer}>
        <AppText
          title={
            isIncomeOrExpense
              ? `${selectedItem} Details`
              : `Top 10 ${selectedItem}`
          }
          titleSize={2}
          titleWeight
          titleSizeWeight={40}
        />
        {getViewAllData().length > 0 && (
          <ViewAll
            onPress={() =>
              navigation.navigate('NormalViewAll', {
                AllData: getViewAllData(),
                dataname: getDataName(),
              })
            }
          />
        )}
      </View>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={{alignItems: 'center', justifyContent: 'center', marginTop: responsiveHeight(4)}}>
      <AppText title={`No ${selectedItem} data found`} titleSize={2} />
    </View>
  );

  if (loader) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APPCOLORS.WHITE}}>
        <ActivityIndicator size="large" color={APPCOLORS.Primary || '#0000ff'} />
        <Text style={{marginTop: 10, color: '#555'}}>Loading {selectedItem} data...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#F8F9FA'}}>
      <Header
        title={selectedItem || 'Details'}
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Dashboard');
          }
        }}
        rightElement={renderRightElement()}
      />

      <FlatList
        data={getData()}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          flexGrow: 1,
          padding: responsiveWidth(2.5),
          paddingBottom: responsiveHeight(5),
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MoreDetail;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(1),
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: responsiveWidth(3.5),
    marginVertical: responsiveHeight(1),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 1,
    marginRight: responsiveWidth(2),
  },
  dateLabel: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(1),
  },
  dateText: {
    fontSize: responsiveFontSize(1.5),
    color: APPCOLORS.BLACK,
    fontWeight: '500',
  },
  resetBtn: {
    backgroundColor: '#F4F6F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: responsiveHeight(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
