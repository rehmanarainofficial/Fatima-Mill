import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BaseUrl from '../../../../utils/BaseUrl';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import SimpleHeader from '../../../../components/SimpleHeader';
import AppText from '../../../../components/AppText';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import RNFS from 'react-native-fs';
import {Notifications} from 'react-native-notifications';
import Toast from 'react-native-toast-message';

const Aging = ({navigation, route}) => {
  const {name, item} = route.params;

  console.log('name, item', name, item);
  const [aging, setAgingData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nav = navigation.addListener('focus', () => {
      if (name == 'Customer') {
        getCustomerAging();
      } else if (name == 'Suppliers') {
        getSupplierAging();
      }
    });

    return nav;
  }, [navigation]);

  const getCustomerAging = () => {
    let data = new FormData();
    data.append('customer_id', item?.customer_id);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BaseUrl}/dash_cust_aging.php`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: data,
    };

    axios
      .request(config)
      .then(response => {
        console.log(JSON.stringify(response.data));
        setAgingData(response.data.data_cust_age);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getSupplierAging = () => {
    let data = new FormData();
    data.append('supplier_id', item?.supplier_id);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BaseUrl}/dash_supp_aging.php`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: data,
    };

    axios
      .request(config)
      .then(response => {
        console.log(JSON.stringify(response.data));
        setAgingData(response.data.data_cust_age);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        // Android 13+ media-specific permission
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
        // Android 12 and below
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
    (sum, row) => sum + parseFloat(row.Invoice_amount || 0),
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

      // ✅ Generate file name using customer/supplier name + timestamp
      const customerName =
        item?.name ||
        item?.customer_name ||
        item?.supplier_name ||
        'Aging_Report';
      const safeName = customerName.replace(/[^a-zA-Z0-9_]/g, '_'); // remove special chars
      const fileName = `${safeName}_${Date.now()}`; // unique file name

      // Generate PDF in app sandbox first
      const options = {
        html: htmlContent,
        fileName,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('📄 Internal PDF created at:', file.filePath);

      // ✅ Move to public Download folder
      const publicDir =
        Platform.Version >= 29
          ? RNFS.DownloadDirectoryPath
          : RNFS.ExternalStorageDirectoryPath + '/Download';

      const destPath = `${publicDir}/${fileName}.pdf`;
      await RNFS.copyFile(file.filePath, destPath);
      console.log('✅ PDF moved to visible folder:', destPath);

      // ✅ Toast message
      Toast.show({
        type: 'success',
        text1: 'PDF Saved',
        text2: `Saved to Downloads as ${fileName}.pdf`,
        visibilityTime: 3000,
      });

      // ✅ Mobile notification
      Notifications.postLocalNotification({
        title: '📄 PDF Saved',
        body: `Your Aging Report (${customerName}) is saved in Downloads.`,
        sound: 'default',
        silent: false,
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

  return (
    <View>
      <SimpleHeader title="Aging" />
      <TouchableOpacity
        style={{
          backgroundColor: APPCOLORS.Primary,
          margin: 20,
          padding: 15,
          borderRadius: 10,
        }}
        onPress={generatePDF}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          {loading ? 'Generating...' : 'Download PDF'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={aging}
        contentContainerStyle={{gap: 20, padding: 20, paddingBottom: 150}}
        renderItem={({item}) => {
          return (
            <View
              style={{
                padding: 20,
                backgroundColor: APPCOLORS.Secondary,
                borderRadius: 10,
              }}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <AppText title={'Reference'} titleSize={2} />
                <AppText title={item.reference} />
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <AppText title={'Transaction date'} titleSize={2} />
                <AppText title={item.tran_date} />
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <AppText title={'Days'} titleSize={2} />
                <AppText title={item.days} />
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <AppText title={'Allocated'} titleSize={2} />
                <AppText title={item.Allocated} />
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <AppText title={'Invoice amount'} titleSize={2} />
                <AppText title={item.Invoice_amount} />
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <AppText title={'Invoice Balance'} titleSize={2} />
                <AppText title={item.invoce_balance} />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default Aging;
