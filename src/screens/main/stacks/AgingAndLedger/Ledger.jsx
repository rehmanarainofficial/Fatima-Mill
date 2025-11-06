import {View, ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BaseUrl from '../../../../utils/BaseUrl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import SimpleHeader from '../../../../components/SimpleHeader';
import AppText from '../../../../components/AppText';
import AppButton from '../../../../components/AppButton';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

const Ledger = ({navigation, route}) => {
  const {name, item} = route.params;

  const [aging, setAgingData] = useState([]);
  const [opening, setOpening] = useState(0);

  const [fromDate, setFromDate] = useState(new Date());
  const [openFrom, setOpenFrom] = useState(false);

  const [EndDate, setEndDate] = useState(new Date());
  const [openEnd, setOpenEnd] = useState(false);

  const [Loader, setLoader] = useState(false);

  useEffect(() => {
    const nav = navigation.addListener('focus', () => {
      if (name === 'Customer') getLeger();
      else if (name === 'Suppliers') getSupplierLeger();
      else if (name === 'Items') getItemsLedger();
    });

    return nav;
  }, [navigation]);

  useEffect(() => {
    if (name === 'Customer') getLeger();
    else if (name === 'Suppliers') getSupplierLeger();
    else if (name === 'Items') getItemsLedger();
  }, [fromDate, EndDate]);

  const getLeger = () => {
    setLoader(true);
    let data = new FormData();
    data.append('customer_id', item.customer_id);
    data.append(
      'from_date',
      moment(fromDate).subtract(1, 'months').format('YYYY-MM-DD'),
    );
    data.append('to_date', moment(EndDate).format('YYYY-MM-DD'));

    axios
      .post(`${BaseUrl}/dash_cust_ledger.php`, data, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      .then(res => {
        setAgingData(res.data.data_cust_age);
        setOpening(res.data.opening);
      })
      .catch(console.log)
      .finally(() => setLoader(false));
  };

  const getSupplierLeger = () => {
    setLoader(true);
    let data = new FormData();
    data.append('supplier_id', item.supplier_id);
    data.append(
      'from_date',
      moment(fromDate).subtract(1, 'months').format('YYYY-MM-DD'),
    );
    data.append('to_date', moment(EndDate).format('YYYY-MM-DD'));

    axios
      .post(`${BaseUrl}/dash_supp_ledger.php`, data, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      .then(res => {
        setAgingData(res.data.data_cust_age);
        setOpening(res.data.opening);
      })
      .catch(console.log)
      .finally(() => setLoader(false));
  };

  const getItemsLedger = () => {
    let data = new FormData();
    data.append('stock_id', item?.stock_id);

    axios
      .post(`${BaseUrl}/dash_item_ledger.php`, data, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      .then(res => {
        setAgingData(res.data.data_cust_age);
      })
      .catch(console.log);
  };

  const renderItem = ({item}) => {
    if (name === 'Items') {
      return (
        <View style={styles.card}>
          <Row label="Location Name" value={item.location_name} />
          <Row label="QOH" value={item.QOH} />
        </View>
      );
    } else {
      return (
        <View style={styles.card}>
          <Row label="Reference" value={item.reference} />
          <Row label="Transaction Date" value={item.tran_date} />
          <Row label="Debit" value={item.debit} />
          <Row label="Credit" value={item.credit} />
          <Row label="Balance" value={item.balance} />
        </View>
      );
    }
  };

  const Row = ({label, value}) => (
    <View style={styles.row}>
      <AppText title={label} titleSize={2} />
      <AppText title={value?.toString() || '-'} />
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: APPCOLORS.WHITE}}>
      <SimpleHeader title="Ledger" />

      <FlatList
        data={aging}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          !Loader && (
            <View style={{alignItems: 'center', marginTop: 40}}>
              <Icon
                name="alert-circle-outline"
                size={40}
                color={APPCOLORS.GRAY}
              />
              <AppText
                title="No data available"
                titleSize={2}
                titleColor={APPCOLORS.GRAY}
              />
            </View>
          )
        }
        ListHeaderComponent={
          <>
            {/* Date Section */}
            <View style={styles.dateContainer}>
              <View style={styles.dateColumn}>
                <AppText title="From Date" titleSize={2} titleWeight />
                <AppButton
                  title={moment(fromDate)
                    .subtract(1, 'months')
                    .format('YYYY-MM-DD')}
                  btnWidth={35}
                  onPress={() => setOpenFrom(true)}
                />
              </View>

              <View style={styles.dateColumn}>
                <AppText title="End Date" titleSize={2} titleWeight />
                <AppButton
                  title={moment(EndDate).format('YYYY-MM-DD')}
                  btnWidth={35}
                  onPress={() => setOpenEnd(true)}
                />
              </View>
            </View>

            {Loader && (
              <ActivityIndicator
                size="large"
                color={APPCOLORS.BLACK}
                style={{marginVertical: 20}}
              />
            )}

            {/* Date Pickers */}
            <DatePicker
              modal
              open={openFrom}
              date={new Date()}
              mode="date"
              onConfirm={date => {
                setOpenFrom(false);
                setFromDate(date);
              }}
              onCancel={() => setOpenFrom(false)}
            />

            <DatePicker
              modal
              open={openEnd}
              date={new Date()}
              mode="date"
              onConfirm={date => {
                setOpenEnd(false);
                setEndDate(date);
              }}
              onCancel={() => setOpenEnd(false)}
            />

            {/* Opening Balance */}
            {opening ? (
              <View style={styles.openingCard}>
                <AppText title="Opening" titleSize={2} titleWeight />
                <AppText
                  title={Number(opening).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  titleSize={2}
                  titleWeight
                />
              </View>
            ) : null}
          </>
        }
        contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 15}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    backgroundColor: '#F8F8F8',
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  dateColumn: {alignItems: 'center', gap: 10},
  openingCard: {
    marginTop: 20,
    marginHorizontal: 15,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    padding: 20,
    backgroundColor: APPCOLORS.Secondary,
    borderRadius: 12,
    elevation: 3,
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});

export default Ledger;
