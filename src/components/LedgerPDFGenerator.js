import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';
import RNFetchBlob from 'react-native-blob-util';
import {fromByteArray} from 'base64-js';
import {ToastAndroid, PermissionsAndroid, Platform} from 'react-native';

export const generateLedgerPDF = async (ledgerData, setLoading) => {
  try {
    setLoading(true);

    // ✅ Handle Android storage rules cleanly (works on Android 11–14)
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
        // Android 13+ → WRITE_EXTERNAL_STORAGE is deprecated; no need to request
        console.log(
          'No storage permission needed for Android 13+ (Scoped Storage)',
        );
      }
    }

    // 🧾 Create PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const {width, height} = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 10;
    const lineHeight = 15;
    let yPos = height - 50;

    const drawText = (text, x, y, size = fontSize, bold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: bold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
    };

    // Helper function to clean text from special characters
    const cleanText = text => {
      if (!text) return '-';
      // Replace tab characters with spaces and remove other problematic characters
      return text
        .replace(/\t/g, '    ') // Replace tabs with 4 spaces
        .replace(/[^\x20-\x7E\n\r]/g, '') // Remove non-printable ASCII characters
        .trim();
    };

    // Title
    drawText('Ledger Transactions Report', width / 2 - 90, yPos, 16, true);
    yPos -= 30;

    // Generated date
    const currentDate = new Date().toLocaleDateString();
    drawText(`Generated on: ${currentDate}`, 50, yPos, 10);
    yPos -= 20;

    // Content
    for (const section of ledgerData) {
      if (yPos < 80) {
        page = pdfDoc.addPage();
        yPos = height - 50;
      }

      // Date header
      const headerText = `Date: ${section.date}`;
      drawText(headerText, 50, yPos, 12, true);
      yPos -= 20;

      // Table headers
      drawText('Reference', 50, yPos, fontSize, true);
      drawText('Name', 120, yPos, fontSize, true);
      drawText('Amount', 450, yPos, fontSize, true);
      drawText('Balance', 520, yPos, fontSize, true);

      yPos -= 15;

      // Horizontal line
      page.drawLine({
        start: {x: 50, y: yPos},
        end: {x: width - 50, y: yPos},
        color: rgb(0, 0, 0),
        thickness: 0.5,
      });

      yPos -= 10;

      // Transactions
      for (const tx of section.transactions) {
        if (yPos < 50) {
          page = pdfDoc.addPage();
          yPos = height - 50;

          // Add headers on new page
          drawText('Reference', 50, yPos, fontSize, true);
          drawText('Name', 120, yPos, fontSize, true);
          drawText('Amount', 450, yPos, fontSize, true);
          drawText('Balance', 520, yPos, fontSize, true);
          yPos -= 25;
        }

        // Clean the data before drawing
        const reference = cleanText(tx.reference);
        const personName = cleanText(tx.person_name);
        const memo = cleanText(tx.memo);
        const amount = parseFloat(tx.amount || 0);
        const balance = parseFloat(tx.balance || 0);

        drawText(reference.substring(0, 25), 50, yPos);

        drawText(personName.substring(0, 35), 120, yPos);

        const amountText = `${amount >= 0 ? '+' : ''}${amount.toFixed(2)}`;
        drawText(amountText, 450, yPos);

        drawText(balance.toFixed(2), 520, yPos);

        yPos -= lineHeight;

        if (memo && memo !== '-') {
          if (yPos < 50) {
            page = pdfDoc.addPage();
            yPos = height - 50;
          }

          drawText(`Memo: ${memo.substring(0, 80)}`, 50, yPos, 9);
          yPos -= lineHeight;
        }

        yPos -= 5;
      }

      yPos -= 15;
    }

    // 🗂 Save PDF
    const pdfBytes = await pdfDoc.save();
    const base64Data = fromByteArray(pdfBytes);

    // 📂 Save in Downloads/MyAppReports (visible in File Manager)
    const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;
    const appFolder = `${downloadDir}/MyAppReports`;
    await RNFetchBlob.fs.mkdir(appFolder).catch(() => {});
    const filePath = `${appFolder}/ledger_report_${Date.now()}.pdf`;

    await RNFetchBlob.fs.writeFile(filePath, base64Data, 'base64');

    // ✅ Optional: open file instantly
    RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');

    ToastAndroid.show(
      '✅ PDF saved to Downloads/MyAppReports',
      ToastAndroid.LONG,
    );
    console.log('📄 File saved at:', filePath);
  } catch (error) {
    console.error('PDF generation failed:', error);
    ToastAndroid.show(
      'PDF generation failed! Check console for details.',
      ToastAndroid.SHORT,
    );
  } finally {
    setLoading(false);
  }
};
