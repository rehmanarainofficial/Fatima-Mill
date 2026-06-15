import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {PermissionsAndroid, Platform} from 'react-native';
import Toast from 'react-native-toast-message';

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
  const num = parseFloat(String(amount).replace(/,/g, ''));
  if (num % 1 === 0) {
    return num.toLocaleString();
  } else {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};

const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') {return true;}

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

export const generateAgingPDF = async (item, aging, setLoading) => {
  setLoading(true);
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setLoading(false);
      return;
    }

    const customerName =
      item?.name ||
      item?.customer_name ||
      item?.supplier_name ||
      'Aging_Report';
    const safeName = customerName.replace(/[^a-zA-Z0-9_]/g, '_');
    const fileName = `${safeName}_${Date.now()}`;
    const currentDate = new Date().toLocaleDateString();

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

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          margin: 30px;
          line-height: 1.5;
        }
        .header-container {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #0784B5;
          padding-bottom: 15px;
        }
        .company-title {
          font-size: 22px;
          font-weight: bold;
          color: #0784B5;
          margin-bottom: 5px;
        }
        .doc-title {
          font-size: 18px;
          font-weight: 600;
          color: #555;
          margin-bottom: 15px;
        }
        .info-section {
          width: 100%;
          margin-bottom: 25px;
          font-size: 13px;
        }
        .info-section td {
          padding: 4px 0;
        }
        .table-container {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .table-container th, .table-container td {
          border: 1px solid #ddd;
          padding: 10px 8px;
          font-size: 12px;
        }
        .table-container th {
          background-color: #0784B5;
          color: white;
          font-weight: bold;
          text-align: center;
        }
        .table-container tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .totals-row {
          font-weight: bold;
          background-color: #e6f2f7 !important;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 11px;
          color: #777;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="company-title">FATIMA BOARD AND PAPER MILL (PVT) LTD</div>
        <div class="doc-title">Aging Report</div>
      </div>

      <table class="info-section">
        <tr>
          <td><strong>Name:</strong> ${customerName}</td>
          <td class="text-right"><strong>Date:</strong> ${currentDate}</td>
        </tr>
      </table>

      <table class="table-container">
        <thead>
          <tr>
            <th>Tran Date</th>
            <th>Days</th>
            <th>Amount</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${aging
            .map(
              row => `
              <tr>
                <td class="text-center">${formatDate(row.tran_date)}</td>
                <td class="text-center">${row.days}</td>
                <td class="text-right">${formatAmount(row.Invoice_amount)}</td>
                <td class="text-right">${formatAmount(row.invoce_balance)}</td>
              </tr>
            `,
            )
            .join('')}
          <tr class="totals-row">
            <td colspan="2" class="text-right">TOTAL</td>
            <td class="text-right">${formatAmount(totalInvoice)}</td>
            <td class="text-right">${formatAmount(totalBalance)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>This is a computer generated report and does not require a physical signature.</p>
        <p>&copy; ${new Date().getFullYear()} FATIMA BOARD AND PAPER MILL (PVT) LTD. All Rights Reserved.</p>
      </div>
    </body>
    </html>
    `;

    const options = {
      html: htmlContent,
      fileName,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    console.log('📄 Aging PDF created at:', file.filePath);

    if (Platform.OS === 'ios') {
      await Share.open({
        url: file.filePath,
        type: 'application/pdf',
        saveToFiles: true,
        title: 'Save Aging Report',
      });
    } else {
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
    }
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
