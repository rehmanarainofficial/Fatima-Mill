import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASEURL from '../../../../utils/BaseUrl';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleHeader from '../../../../components/SimpleHeader';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {PermissionsAndroid, Platform} from 'react-native';
import {Notifications} from 'react-native-notifications';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Aging = ({navigation, route}) => {
  const {name, item} = route.params;
  const [aging, setAgingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  console.log(aging);

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
        headers: {'Content-Type': 'multipart/form-data'},
        timeout: 10000,
      })
      .then(res => setAgingData(res.data.data_cust_age || []))
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

  // Calculate totals
  const totalAllocated = aging.reduce(
    (sum, row) => sum + parseFloat(row.Allocated || 0),
    0,
  );
  const totalInvoice = aging.reduce(
    (sum, row) =>
      sum + parseFloat(String(row.Invoice_amount || '0').replace(/,/g, '')),
    0,
  );

  const totalBalance = aging.reduce(
    (sum, row) => sum + parseFloat(row.invoce_balance || 0),
    0,
  );

  // Current date in readable format
  const currentDate = new Date().toLocaleDateString();

  const htmlContent = `
  <div style="text-align: center; font-family: Arial, sans-serif;">
    <h1>Aging Report</h1>
    <p><strong>Name:</strong> ${
      item?.name || item?.customer_name || item?.supplier_name || ''
    }</p>
    <p><strong>Date:</strong> ${currentDate}</p>
  </div>

  <table border="1" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
    <thead>
      <tr style="background-color: #f0f0f0;">
        <th style="padding: 8px;">Reference</th>
        <th style="padding: 8px;">Tran Date</th>
        <th style="padding: 8px;">Days</th>
        <th style="padding: 8px;">Allocated</th>
        <th style="padding: 8px;">Invoice Amt</th>
        <th style="padding: 8px;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${aging
        .map(
          row => `
          <tr>
            <td style="padding: 8px;">${row.reference}</td>
            <td style="padding: 8px;">${row.tran_date}</td>
            <td style="padding: 8px;">${row.days}</td>
            <td style="padding: 8px; text-align: right;">${row.Allocated}</td>
            <td style="padding: 8px; text-align: right;">${row.Invoice_amount}</td>
            <td style="padding: 8px; text-align: right;">${row.invoce_balance}</td>
          </tr>
        `,
        )
        .join('')}
    </tbody>
    <tfoot>
      <tr style="font-weight: bold; background-color: #e6e6e6;">
        <td colspan="3" style="padding: 8px; text-align: right;">TOTAL</td>
        <td style="padding: 8px; text-align: right;">${totalAllocated.toFixed(
          2,
        )}</td>
        <td style="padding: 8px; text-align: right;">${totalInvoice.toFixed(
          2,
        )}</td>
        <td style="padding: 8px; text-align: right;">${totalBalance.toFixed(
          2,
        )}</td>
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

      Notifications.postLocalNotification({
        title: '📄 PDF Saved',
        body: `Your Aging Report (${customerName}) is saved in Downloads.`,
        sound: 'default',
        silent: false,
        channelId: 'pdf-saved-channel',
        userInfo: {filePath: destPath},
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
        <Text style={{fontSize: 16, marginBottom: 10}}>
          Loading Aging Data...
        </Text>
        <ActivityIndicator size="large" color={APPCOLORS.Primary} />
      </View>
    );
  }
  
  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar barStyle="dark-content" backgroundColor={APPCOLORS.WHITE} />

      {/* Custom Header */}
      <LinearGradient
        colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
        style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={APPCOLORS.WHITE} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Aging - {item?.name || item?.customer_name || item?.supplier_name || ''}
        </Text>

        <TouchableOpacity
          onPress={generatePDF}
          disabled={loading || aging.length === 0}>
          {loading ? (
            <ActivityIndicator size="small" color={APPCOLORS.WHITE} />
          ) : (
            <MaterialIcons
              name="file-download"
              size={26}
              color={
                aging.length === 0 ? APPCOLORS.TEXTFIELDCOLOR : APPCOLORS.WHITE
              }
            />
          )}
        </TouchableOpacity>
      </LinearGradient>

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
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              {item.reference}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              {item.tran_date}
            </Text>
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
            <Text style={{flex: 1, textAlign: 'center', fontSize: 12}}>
              {item.Invoice_amount || '-'}
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
              <Icon name="alert-circle-outline" size={50} color="#999" />
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 16,
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
            {['Reference', 'Tran Date', 'Days', 'Amount'].map((col, index) => (
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
                  style={{color: 'white', fontWeight: 'bold', fontSize: 13}}>
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
            <Text
              style={{
                flex: 3,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                borderRightWidth: 1,
                borderColor: '#ccc',
              }}>
              TOTAL
            </Text>

            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 'bold',
              }}>
              {totalInvoice.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = {
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 80,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    color: APPCOLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
};

export default Aging;