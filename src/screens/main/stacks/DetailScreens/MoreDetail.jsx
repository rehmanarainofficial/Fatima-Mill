import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import SimpleHeader from '../../../../components/SimpleHeader';
import PieChart from 'react-native-pie-chart';
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
import Header from '../../../../components/Header';

const MoreDetail = ({navigation, route}) => {
  const {slider_data, selectedItem} = route.params;
  console.log(slider_data);
  console.log(selectedItem);

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
      loadSpecificData(selectedItem);
    }
  }, [selectedItem]);

  const loadSpecificData = async itemType => {
    setLoader(true);
    try {
      switch (itemType) {
        case 'Bank & Cash':
          await getBankBalance();
          break;
        case 'Receivable':
          await getReceivable();
          break;
        case 'Payable':
          await getPayable();
          break;
        case 'Inventory Valuation':
          await getItemBalance();
          break;
        case 'Salesman':
          await getSalesman();
          break;
        default:
          console.log('Unknown item type:', itemType);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  const getBankBalance = async () => {
    const allbalancedata = await GetBankBalance();

    if (allbalancedata?.data_bank_bal) {
      const balanceBar = allbalancedata?.data_bank_bal.map((item, index) => {
        const rawValue = parseFloat(Math.round(item.bank_balance));
        const cleanValue = rawValue < 0 ? 5 : rawValue;
        return {
          value: cleanValue,
          color: colors[index % colors.length],
        };
      });
      setActiveChartData(balanceBar);
    }
    setActiveData(allbalancedata);
  };

  const getReceivable = async () => {
    const AllRecivable = await GetReceivable();

    if (AllRecivable?.data_cust_bal) {
      const Recivable = AllRecivable?.data_cust_bal.map((item, index) => {
        const rawValue = parseFloat(Math.round(item.Balance));
        const cleanValue = rawValue < 0 ? 5 : rawValue;
        return {
          value: cleanValue,
          color: colors[index % colors.length],
        };
      });
      setActiveChartData(Recivable);
    }
    setActiveData(AllRecivable);
  };

  const getPayable = async () => {
    const AllPayable = await GetPayable();

    if (AllPayable?.data_supp_bal) {
      const Payable = AllPayable?.data_supp_bal.map((item, index) => {
        const rawValue = parseFloat(Math.round(item.Balance));
        const cleanValue = rawValue < 0 ? 5 : rawValue;
        return {
          value: cleanValue,
          color: colors[index % colors.length],
        };
      });
      setActiveChartData(Payable);
    }
    setActiveData(AllPayable);
  };

  const getItemBalance = async () => {
    const AllItemBalance = await GetItemBalance();

    if (AllItemBalance?.data_item_bal) {
      const ItemBalanceBar = AllItemBalance?.data_item_bal.map(
        (item, index) => {
          const rawValue = parseFloat(Math.round(item.total));
          const cleanValue = rawValue < 0 ? 5 : rawValue;
          return {
            value: cleanValue,
            color: colors[index % colors.length],
          };
        },
      );
      setActiveChartData(ItemBalanceBar);
    }
    setActiveData(AllItemBalance);
  };

  const getSalesman = async () => {
    const AllSalesman = await GetSalesman();

    if (AllSalesman?.data_salesman_bal) {
      const SalesmanBar = AllSalesman?.data_salesman_bal.map((item, index) => {
        const rawValue = parseFloat(Math.round(item.Balance));
        const cleanValue = rawValue < 0 ? 5 : rawValue;
        return {
          value: cleanValue,
          color: colors[index % colors.length],
        };
      });
      setActiveChartData(SalesmanBar);
    }
    setActiveData(AllSalesman);
  };

  // Data ko render karne ke liye helper functions
  const renderChart = () => (
    <View
      style={{alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
      <View style={{position: 'absolute', zIndex: 1}}>
        <AppText title={selectedItem} titleSize={2} titleWeight />
      </View>
      {activeChartData && (
        <PieChart
          widthAndHeight={250}
          series={activeChartData}
          cover={0.7}
          style={{alignSelf: 'center'}}
        />
      )}
    </View>
  );

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
        index={index} // added
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
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <AppText title={`No ${selectedItem} data found`} titleSize={2} />
    </View>
  );

  if (loader) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading {selectedItem} data...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <Header
        title={selectedItem || 'Details'}
        rightIcon={
          selectedItem === 'Inventory Valuation'
            ? 'inventory' // custom icon for Inventory
            : 'assignment' // default ledger icon
        }
        onRightPress={() => {
          if (selectedItem === 'Inventory Valuation') {
            navigation.navigate('StockSheetScreen');
          } else {
            navigation.navigate('ViewLedger');
          }
        }}
      />

      <FlatList
        data={getData()}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{flexGrow: 1, padding: 20}}
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
    marginTop: 20,
  },
});
