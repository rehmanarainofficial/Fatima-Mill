import React, { useEffect, useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import PieChart from 'react-native-pie-chart';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../../../components/AppText';
import NameBalanceContainer from '../../../../components/NameBalanceContainer';
import ViewAll from '../../../../components/ViewAll';
import {
  GetBankBalance,
  GetSalesman,
  GetItemBalance,
  GetPayable,
  GetReceivable,
} from '../../../../global/ChartApisCall';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';

const MoreDetail = ({ navigation, route }) => {
  const { selectedItem } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cachedData = useRef({});

  const [activeData, setActiveData] = useState(null);
  const [activeChartData, setActiveChartData] = useState(null);
  const [loader, setLoader] = useState(false);

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
      if (cachedData.current[selectedItem]) {
        setActiveData(cachedData.current[selectedItem].data);
        setActiveChartData(cachedData.current[selectedItem].chart);
      } else {
        loadSpecificData(selectedItem);
      }
    }
  }, [selectedItem]);

  const loadSpecificData = async itemType => {
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

        default:
          console.log('Unknown item type:', itemType);
      }

      cachedData.current[itemType] = { data, chart };

      setActiveData(data);
      setActiveChartData(chart);
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  // Custom Header Component
  const CustomHeader = () => (
    <View style={[styles.customHeader, {
      height: responsiveHeight(Platform.OS === 'ios' ? 8 : 10) + (Platform.OS === 'ios' ? insets.top : 0),
      paddingTop: Platform.OS === 'ios' ? insets.top + responsiveHeight(-2) : 0,
      width: width,
    }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
        <Ionicons
          name="arrow-back"
          size={responsiveFontSize(3)}
          color="white"
        />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{selectedItem || 'Details'}</Text>

      <View style={styles.headerIcons}>
        {selectedItem === 'Inventory Valuation' ? (
          <>
            {/* All Movements Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                navigation.navigate('StockMovements', { fromAllMovements: true })
              }>
              <MaterialIcons
                name="swap-horiz"
                size={responsiveFontSize(3)}
                color="white"
              />
            </TouchableOpacity>

            {/* Stock Sheet Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('StockSheetScreen')}>
              <MaterialIcons
                name="inventory"
                size={responsiveFontSize(3)}
                color="white"
              />
            </TouchableOpacity>
          </>
        ) : (
          /* Default Ledger Icon */
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('ViewLedger')}>
            <MaterialIcons
              name="assignment"
              size={responsiveFontSize(3)}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Data ko render karne ke liye helper functions
  const renderChart = () => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: responsiveHeight(2),
      }}>
      <View style={{ position: 'absolute', zIndex: 1 }}>
        <AppText title={selectedItem} titleSize={2} titleWeight />
      </View>
      {activeChartData && (
        <PieChart
          widthAndHeight={responsiveWidth(60)}
          series={activeChartData}
          cover={0.7}
          style={{ alignSelf: 'center' }}
        />
      )}
    </View>
  );

  const renderItem = ({ item, index }) => {
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
      {renderChart()}

      <View style={styles.headerContainer}>
        <AppText
          title={`Top 10 ${selectedItem}`}
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
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <AppText title={`No ${selectedItem} data found`} titleSize={2} />
    </View>
  );

  if (loader) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading {selectedItem} data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />

      <FlatList
        data={getData()}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          flexGrow: 1,
          padding: responsiveWidth(2),
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
  },
  customHeader: {
    backgroundColor: '#0784B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
});
