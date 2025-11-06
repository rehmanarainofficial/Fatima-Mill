import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {ToastAndroid, PermissionsAndroid, Platform} from 'react-native';

export const generateLedgerPDF = async (
  ledgerData,
  setLoading,
  fromDate,
  toDate,
) => {
  try {
    setLoading(true);

    //  Handle Android storage rules
    if (Platform.OS === 'android') {
      const sdk = parseInt(Platform.Version, 10);
      if (sdk < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to save PDF file.',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          ToastAndroid.show('Storage permission denied!', ToastAndroid.SHORT);
          setLoading(false);
          return;
        }
      } else {
        console.log('No storage permission needed for Android 13+');
      }
    }

    const currentDate = new Date().toLocaleDateString();
    const firstTx = ledgerData?.[0]?.transactions?.[0]?.person_name || 'N/A';
    const customerName = firstTx;

    const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 10px;">
    <h2 style="text-align: center; color: #222;">Ledger Transactions Report</h2>

  <!-- Customer & Company -->
<div
  style="
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    line-height: 1.1;
    margin-bottom: 2px;
  "
>
  <p style="margin: 0;"><strong>Customer:</strong> ${customerName}</p>
  <p style="margin: 0;"><strong>Company:</strong> FATIMA BOARD AND PAPER MILL (PVT) LTD</p>
</div>

<!-- From-To & Generated On -->
<div
  style="
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #444;
    line-height: 1.1;
    margin-bottom: 10px;
  "
>
  <p style="margin: 0;"><strong>From:</strong> ${fromDate} &nbsp;&nbsp; <strong>To:</strong> ${toDate}</p>
  <p style="margin: 0;"><strong>Generated on:</strong> ${currentDate}</p>
</div>

    <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 6px;">Date</th>
          <th style="padding: 6px;">Reference</th>
          <th style="padding: 6px;">Name</th>
          <th style="padding: 6px;">Amount</th>
          <th style="padding: 6px;">Balance</th>
        </tr>
      </thead>
      <tbody>
        ${ledgerData
          .map(section =>
            section.transactions
              .map(
                tx => `
                <tr>
                  <td style="padding: 6px;">${section.date}</td>
                  <td style="padding: 6px;">${tx.reference || '-'}</td>
                  <td style="padding: 6px;">${tx.person_name || '-'}</td>
                  <td style="padding: 6px; text-align: right;">${parseFloat(
                    tx.amount || 0,
                  ).toFixed(2)}</td>
                  <td style="padding: 6px; text-align: right;">${parseFloat(
                    tx.balance || 0,
                  ).toFixed(2)}</td>
                </tr>
                ${
                  tx.memo
                    ? `<tr><td colspan="5" style="padding: 4px; font-style: italic;">Memo: ${tx.memo}</td></tr>`
                    : ''
                }
              `,
              )
              .join(''),
          )
          .join('')}
      </tbody>
    </table>

    <hr style="margin: 30px 0;"/>
    <p style="text-align: center; font-size: 12px; color: #666;">
      FATIMA BOARD AND PAPER MILL (PVT) LTD
    </p>
  </div>
`;

    // 🧠 Safe filename
    const safeName = (customerName || 'Ledger_Report').replace(
      /[^a-zA-Z0-9_]/g,
      '_',
    );
    const fileName = `${safeName}_${Date.now()}`;

    // 📄 Generate PDF file in app sandbox
    const options = {
      html: htmlContent,
      fileName,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);

    // ✅ Move to visible Downloads/MyAppReports folder
    const downloadDir =
      Platform.Version >= 29
        ? RNFS.DownloadDirectoryPath
        : RNFS.ExternalStorageDirectoryPath + '/Download';

    const appFolder = `${downloadDir}/MyAppReports`;
    await RNFS.mkdir(appFolder).catch(() => {});
    const destPath = `${appFolder}/${fileName}.pdf`;

    await RNFS.copyFile(file.filePath, destPath);

    ToastAndroid.show('PDF saved to Downloads', ToastAndroid.LONG);
  } catch (error) {
    console.error('PDF generation error:', error);
    ToastAndroid.show('PDF generation failed!', ToastAndroid.SHORT);
  } finally {
    setLoading(false);
  }
};
