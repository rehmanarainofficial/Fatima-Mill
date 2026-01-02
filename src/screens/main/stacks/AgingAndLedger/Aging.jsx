import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASEURL from '../../../../utils/BaseUrl';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Aging = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { name, item } = route.params;
  const [aging, setAgingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (name === 'Customer') {
      getCustomerAging();
    } else if (name === 'Suppliers') {
      getSupplierAging();
    }
  }, []);

  const getCustomerAging = () => {
    setDataLoading(true);
    let data = new FormData();
    data.append('customer_id', item?.customer_id);
    axios
      .post(`${BASEURL}dash_cust_aging.php`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => {
        setAgingData(res.data.data_cust_age || [])
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
        headers: { 'Content-Type': 'multipart/form-data' },
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

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);

        return (
          granted['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  // Format date from "2024-05-18" to "18/05/2024"
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format amount - remove .00 if whole number
  const formatAmount = (amount) => {
    if (!amount) return '0';
    // Remove commas and convert to number
    const num = parseFloat(String(amount).replace(/,/g, ''));
    // Format with commas but without .00 for whole numbers
    if (num % 1 === 0) {
      return num.toLocaleString();
    } else {
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  // Calculate totals
  const totalInvoice = aging.reduce(
    (sum, row) =>
      sum + parseFloat(String(row.Invoice_amount || '0').replace(/,/g, '')),
    0,
  );

  const totalBalance = aging.reduce(
    (sum, row) => sum + parseFloat(String(row.invoce_balance || '0').replace(/,/g, '')),
    0,
  );

  // Current date in readable format
  const currentDate = new Date().toLocaleDateString();

  const htmlContent = `
  <div style="text-align: center; font-family: Arial, sans-serif;">
    <h1>Aging Report</h1>
    <p><strong>Name:</strong> ${item?.name || item?.customer_name || item?.supplier_name || ''
    }</p>
    <p><strong>Date:</strong> ${currentDate}</p>
  </div>

  <table border="1" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
    <thead>
      <tr style="background-color: #f0f0f0;">
        <th style="padding: 8px;">Tran Date</th>
        <th style="padding: 8px;">Days</th>
        <th style="padding: 8px;">Amount</th>
        <th style="padding: 8px;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${aging
      .map(
        row => `
          <tr>
            <td style="padding: 8px;">${formatDate(row.tran_date)}</td>
            <td style="padding: 8px;">${row.days}</td>
            <td style="padding: 8px; text-align: right;">${formatAmount(row.Invoice_amount)}</td>
            <td style="padding: 8px; text-align: right;">${formatAmount(row.invoce_balance)}</td>
          </tr>
        `,
      )
      .join('')}
    </tbody>
    <tfoot>
      <tr style="font-weight: bold; background-color: #e6e6e6;">
        <td colspan="2" style="padding: 8px; text-align: right;">TOTAL</td>
        <td style="padding: 8px; text-align: right;">${formatAmount(totalInvoice)}</td>
        <td style="padding: 8px; text-align: right;">${formatAmount(totalBalance)}</td>
      </tr>
    </tfoot>
  </table>
`;

  const generatePDF = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) return;

      const customerName =
        item?.name ||
        item?.customer_name ||
        item?.supplier_name ||
        'Aging_Report';
      const safeName = customerName.replace(/[^a-zA-Z0-9_]/g, '_');
      const fileName = `${safeName}_${Date.now()}`;

      const options = {
        html: htmlContent,
        fileName,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('📄 Internal PDF created at:', file.filePath);

      const publicDir =
        Platform.Version >= 29
          ? RNFS.DownloadDirectoryPath
          : RNFS.ExternalStorageDirectoryPath + '/Download';

      const destPath = `${publicDir}/${fileName}.pdf`;
      await RNFS.copyFile(file.filePath, destPath);
      console.log('✅ PDF moved to visible folder:', destPath);

      Toast.show({
        type: 'success',
        text1: 'PDF Saved',
        text2: `Saved to Downloads as ${fileName}.pdf`,
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to generate PDF.',
      });
    } finally {
      setLoading(false);
    }
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
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Loading Aging Data...
        </Text>
        <ActivityIndicator size="large" color={APPCOLORS.Primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Custom Header */}
      <View
        style={[styles.header, {
          height: responsiveHeight(Platform.OS === 'ios' ? 10 : 10) + (Platform.OS === 'ios' ? insets.top : 0),
          paddingTop: Platform.OS === 'ios' ? insets.top + responsiveHeight(1) : 0,
          width: '100%',
        }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
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
          style={{ padding: 5 }}
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
        renderItem={({ item, index }) => (
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
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 12 }}>
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