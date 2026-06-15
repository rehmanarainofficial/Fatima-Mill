import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASEURL from '../../../../utils/BaseUrl';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {generateAgingPDF} from '../../../../components/AgingPDFGenerator';

const Aging = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {name, item} = route.params;
  const [aging, setAgingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (name === 'Customer') {
      getCustomerAging();
    } else if (name === 'Suppliers') {
      getSupplierAging();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCustomerAging = () => {
    setDataLoading(true);
    let data = new FormData();
    data.append('customer_id', item?.customer_id);
    axios
      .post(`${BASEURL}dash_cust_aging.php`, data, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      .then(res => {
        setAgingData(res.data.data_cust_age || []);
        console.log('Customer Aging:', res.data);
      })
      .catch(err => console.warn('API error', err.message))
      .finally(() => setDataLoading(false));
  };

  const getSupplierAging = () => {
    setDataLoading(true);
    let data = new FormData();
    data.append('supplier_id', item?.supplier_id);

    axios
      .post(`${BASEURL}dash_supp_aging.php`, data, {
        headers: {'Content-Type': 'multipart/form-data'},
        maxBodyLength: Infinity,
      })
      .then(response => {
        console.log('Supplier Aging:', response.data);
        setAgingData(response.data.data_cust_age);
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        setDataLoading(false);
      });
  };

  // Format date from "2024-05-18" to "18/05/2024"
  const formatDate = dateString => {
    if (!dateString) {return '-';}
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format amount - remove .00 if whole number
  const formatAmount = amount => {
    if (!amount) {return '0';}
    // Remove commas and convert to number
    const num = parseFloat(String(amount).replace(/,/g, ''));
    // Format with commas but without .00 for whole numbers
    if (num % 1 === 0) {
      return num.toLocaleString();
    } else {
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  // Calculate totals
  const totalInvoice = aging.reduce(
    (sum, row) =>
      sum + parseFloat(String(row.Invoice_amount || '0').replace(/,/g, '')),
    0,
  );

  const totalBalance = aging.reduce(
    (sum, row) =>
      sum + parseFloat(String(row.invoce_balance || '0').replace(/,/g, '')),
    0,
  );

  const generatePDF = () => {
    generateAgingPDF(item, aging, setLoading);
  };

  if (dataLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}>
        <Text style={{fontSize: 16, marginBottom: 10}}>
          Loading Aging Data...
        </Text>
        <ActivityIndicator size="large" color={APPCOLORS.Primary} />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          {
            height:
              responsiveHeight(Platform.OS === 'ios' ? 8 : 10) +
              (Platform.OS === 'ios' ? insets.top : 0),
            paddingTop:
              Platform.OS === 'ios' ? insets.top + responsiveHeight(-2) : 0,
            width: '100%',
          },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Ionicons
            name="arrow-back"
            size={responsiveFontSize(3)}
            color="white"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Aging -{' '}
          {item?.name || item?.customer_name || item?.supplier_name || ''}
        </Text>

        <TouchableOpacity
          onPress={generatePDF}
          style={{padding: 5}}
          disabled={loading || aging.length === 0}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons
              name="file-download"
              size={responsiveFontSize(3)}
              color="white"
            />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={aging}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
              borderTopWidth: 1,
              borderColor: '#ccc',
              paddingVertical: 10,
            }}>
            {/* Tran Date - formatted as dd/mm/yyyy */}
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              {formatDate(item.tran_date)}
            </Text>

            {/* Days */}
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              {item.days}
            </Text>

            {/* Amount - formatted without .00 */}
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              {formatAmount(item.Invoice_amount)}
            </Text>

            {/* Balance - formatted without .00 */}
            <Text style={{flex: 1, textAlign: 'center', fontSize: 12}}>
              {formatAmount(item.invoce_balance)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !dataLoading && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 50,
              }}>
              <Icon
                name="alert-circle-outline"
                size={responsiveFontSize(6)}
                color="#999"
              />
              <Text
                style={{
                  marginTop: 10,
                  fontSize: responsiveFontSize(2),
                  color: '#999',
                  fontWeight: '500',
                }}>
                No aging data available
              </Text>
            </View>
          )
        }
        ListHeaderComponent={() => (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: APPCOLORS.Primary,
              paddingVertical: 10,
            }}>
            {/* Updated Headers: Reference removed, Balance added at the end */}
            {['Tran Date', 'Days', 'Amount', 'Balance'].map((col, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  borderRightWidth: index !== 3 ? 1 : 0,
                  borderRightColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.6),
                  }}>
                  {col}
                </Text>
              </View>
            ))}
          </View>
        )}
        ListFooterComponent={() => (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#e6e6e6',
              paddingVertical: 12,
              borderTopWidth: 1,
              borderColor: '#ccc',
              marginTop: 5,
            }}>
            {/* TOTAL spans first 2 columns */}
            <Text
              style={{
                flex: 2,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              TOTAL
            </Text>

            {/* Total Amount - formatted without .00 */}
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              {formatAmount(totalInvoice)}
            </Text>

            {/* Total Balance - formatted without .00 */}
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 'bold',
              }}>
              {formatAmount(totalBalance)}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = {
  header: {
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
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
};

export default Aging;
