import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import RNFetchBlob from 'react-native-blob-util';
import { fromByteArray } from 'base64-js';
import { ToastAndroid, PermissionsAndroid, Platform } from 'react-native';

export const generateLedgerPDF = async (ledgerData, setLoading) => {
  try {
    setLoading(true);

    // ✅ Handle storage permission (Android 13+ safe)
    if (Platform.OS === 'android') {
      const sdk = Platform.constants?.Release ? parseInt(Platform.constants.Release) : 30;

      if (sdk < 13) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs storage access to save PDF in Downloads folder.',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          ToastAndroid.show('Storage permission denied!', ToastAndroid.SHORT);
          setLoading(false);
          return;
        }
      } else {
        // Android 13+ (no WRITE_EXTERNAL_STORAGE)
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);
        // No need to check; PDFs are allowed in Downloads by default
      }
    }

    // 🧾 Create PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    const lineHeight = 20;
    let yPos = height - 60;

    const drawText = (text, x, y, size = fontSize, bold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: bold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
    };

    // Title
    drawText('Ledger Transactions', width / 2 - 80, yPos, 18, true);
    yPos -= 40;

    // Content
    for (const section of ledgerData) {
      if (yPos < 100) {
        page = pdfDoc.addPage();
        yPos = height - 60;
      }

      const headerText = section.date;
      const textWidth = font.widthOfTextAtSize(headerText, 14);
      const padding = 6;

      page.drawRectangle({
        x: 50 - padding,
        y: yPos - padding,
        width: textWidth + 2 * padding,
        height: 20 + padding / 2,
        color: rgb(0, 0, 0),
      });

      page.drawText(headerText, {
        x: 50,
        y: yPos,
        size: 14,
        font,
        color: rgb(1, 1, 1),
      });

      yPos -= lineHeight * 1.5;

      drawText('Reference', 50, yPos, fontSize, true);
      drawText('Name', 150, yPos, fontSize, true);
      drawText('Memo', 300, yPos, fontSize, true);
      drawText('Amount', 480, yPos, fontSize, true);

      yPos -= lineHeight;

      page.drawLine({
        start: { x: 50, y: yPos + 5 },
        end: { x: width - 50, y: yPos + 5 },
        color: rgb(0, 0, 0),
        thickness: 0.5,
      });

      yPos -= 10;

      for (const tx of section.transactions) {
        if (yPos < 60) {
          page = pdfDoc.addPage();
          yPos = height - 60;
        }

        drawText(`${tx.reference || '-'}`, 50, yPos);
        drawText(`${tx.person_name || '-'}`, 150, yPos);

        // Wrap memo
        const memo = tx.memo || '-';
        const memoLines = [];
        const maxWidth = 160;
        let currentLine = '';

        for (const word of memo.split(' ')) {
          const testLine = currentLine + word + ' ';
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (textWidth > maxWidth) {
            memoLines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        }
        memoLines.push(currentLine.trim());

        for (const line of memoLines) {
          drawText(line, 300, yPos);
          yPos -= lineHeight * 0.8;
        }

        const amountText = `${parseFloat(tx.amount) > 0 ? '+' : '-'}${Math.abs(tx.amount)}`;
        drawText(amountText, 480, yPos + lineHeight * 0.8, fontSize, true);

        yPos -= 5;
      }

      yPos -= 20;
    }

    // 🗂 Save PDF
    const pdfBytes = await pdfDoc.save();
    const base64Data = fromByteArray(pdfBytes);

    const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;
    const filePath = `${downloadDir}/ledger_report_${Date.now()}.pdf`;

    await RNFetchBlob.fs.writeFile(filePath, base64Data, 'base64');

    ToastAndroid.show('PDF saved to Downloads folder!', ToastAndroid.LONG);

    console.log('✅ Saved path:', filePath);
  } catch (error) {
    console.error('PDF generation failed:', error);
    ToastAndroid.show('PDF generation failed!', ToastAndroid.SHORT);
  } finally {
    setLoading(false);
  }
};
