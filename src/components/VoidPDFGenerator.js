import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

export const shareVoidTransactionPDF = async (
  item,
  header,
  details,
  selectedVoucherTitle,
  voucherTypeId,
) => {
  const decodeHtml = html => {
    if (!html) {
      return '';
    }
    return html
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');
  };

  const formatDateDisplay = dateStr => {
    if (!dateStr) {
      return '';
    }
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      return dateStr;
    }
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // dd/mm/yyyy
  };

  const voucherTypesMap = {
    0: 'Journal Entry',
    1: 'Bank Payment',
    2: 'Bank Deposit',
    41: 'Cash Payment',
    42: 'Cash Receipt',
    4: 'Funds Transfer',
    10: 'Sales Invoice',
    11: 'Customer Credit Note',
    12: 'Customer Payment',
    13: 'Delivery Note',
    16: 'Location Transfer',
    17: 'Inventory Adjustment',
    20: 'Supplier Invoice',
    21: 'Supplier Credit Note',
    43: 'Import Invoice',
    22: 'Supplier Payment',
    25: 'GRN',
    26: 'Work Order',
    28: 'Work Order Issue',
    29: 'Work Order Production',
    35: 'Cost Update',
  };

  const resolvedTitle =
    selectedVoucherTitle ||
    voucherTypesMap[voucherTypeId] ||
    'TRANSACTION VOUCHER';
  const docTitle = resolvedTitle.toUpperCase();
  const isDeliveryOrGRN = voucherTypeId === 13 || voucherTypeId === 25;

  const refLabel =
    voucherTypeId === 10 || voucherTypeId === 11 || voucherTypeId === 13
      ? 'Sales Order No.:'
      : voucherTypeId === 20 || voucherTypeId === 21 || voucherTypeId === 25
      ? 'Purchase Order No.:'
      : 'Reference:';

  const partyLabel =
    voucherTypeId === 20 ||
    voucherTypeId === 21 ||
    voucherTypeId === 22 ||
    voucherTypeId === 25
      ? 'Received From:'
      : 'Delivered To:';

  const docDate = header.trans_date || formatDateDisplay(item.ord_date) || '';
  const docNo = item.trans_no || '';
  const docRef = header.reference || item.reference || '-';
  const customerName = header.name || '';
  const driverName = header.driver_name || '';
  const vehicleNo = header.location_name || '';
  const salesPerson = header.salesman || '';
  const poNo = header.customer_ref || '';

  let totalQty = 0;
  const itemRows = details
    .map((row, index) => {
      const qty = parseFloat(row.quantity) || 0;
      const price = parseFloat(row.unit_price) || 0;
      const rowTotal = qty * price;
      totalQty += qty;

      if (isDeliveryOrGRN) {
        return `
        <tr>
          <td style="text-align: center; padding: 6px; border: 1px solid #000; width: 10%;">${
            index + 1
          }</td>
          <td style="padding: 6px; border: 1px solid #000; width: 60%;">
            ${decodeHtml(row.description)}
            ${
              row.long_description
                ? `<div style="font-size: 10px; color: #555; margin-top: 2px;">${decodeHtml(
                    row.long_description,
                  )}</div>`
                : ''
            }
          </td>
          <td style="text-align: center; padding: 6px; border: 1px solid #000; width: 15%;">KG</td>
          <td style="text-align: right; padding: 6px; border: 1px solid #000; width: 15%;">${qty.toLocaleString(
            undefined,
            {minimumFractionDigits: 2},
          )}</td>
        </tr>
      `;
      } else {
        return `
        <tr>
          <td style="text-align: center; padding: 6px; border: 1px solid #000; width: 8%;">${
            index + 1
          }</td>
          <td style="padding: 6px; border: 1px solid #000; width: 45%;">
            ${decodeHtml(row.description)}
            ${
              row.long_description
                ? `<div style="font-size: 10px; color: #555; margin-top: 2px;">${decodeHtml(
                    row.long_description,
                  )}</div>`
                : ''
            }
          </td>
          <td style="text-align: center; padding: 6px; border: 1px solid #000; width: 15%;">KG</td>
          <td style="text-align: right; padding: 6px; border: 1px solid #000; width: 10%;">${qty.toLocaleString(
            undefined,
            {minimumFractionDigits: 2},
          )}</td>
          <td style="text-align: right; padding: 6px; border: 1px solid #000; width: 10%;">${price.toLocaleString(
            undefined,
            {minimumFractionDigits: 2},
          )}</td>
          <td style="text-align: right; padding: 6px; border: 1px solid #000; width: 12%; font-weight: bold;">${rowTotal.toLocaleString(
            undefined,
            {minimumFractionDigits: 2},
          )}</td>
        </tr>
      `;
      }
    })
    .join('');

  const totalAmount = parseFloat(
    header.total || item.total || 0,
  ).toLocaleString(undefined, {minimumFractionDigits: 2});

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #000;
        margin: 20px;
        padding: 0;
      }
      .header-container {
        width: 100%;
        margin-bottom: 20px;
      }
      .company-title {
        font-size: 20px;
        font-weight: bold;
        text-transform: uppercase;
      }
      .company-info {
        font-size: 11px;
        color: #333;
        line-height: 1.4;
      }
      .doc-title-container {
        text-align: right;
        vertical-align: top;
      }
      .doc-title {
        font-size: 24px;
        font-weight: bold;
        color: #999;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .doc-info {
        font-size: 12px;
        line-height: 1.4;
      }
      hr {
        border: none;
        border-top: 1px solid #000;
        margin: 15px 0;
      }
      .info-table {
        width: 100%;
        margin-bottom: 20px;
        font-size: 12px;
      }
      .info-table td {
        padding: 4px 0;
        vertical-align: top;
      }
      .info-label {
        font-weight: bold;
        width: 120px;
      }
      .item-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
        font-size: 12px;
      }
      .item-table th, .item-table td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      .item-table th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      .text-right {
        text-align: right;
      }
      .text-center {
        text-align: center;
      }
      .footer-signatures {
        width: 100%;
        margin-top: 60px;
        font-size: 11px;
        text-align: center;
      }
      .signature-line {
        border-top: 1px solid #000;
        width: 150px;
        margin: 0 auto 5px auto;
      }
    </style>
    </head>
    <body>
      <table class="header-container" style="width: 100%;">
        <tr>
          <td style="width: 60%;">
            <div class="company-title">FATIMA BOARD AND PAPER MILL (PVT) LTD</div>
            <div class="company-info">
              LA 10/1- K Block-22 F.B industrial Area Karachi<br/>
              Phone: 03452090354<br/>
              Invoice Office Extension No. 229
            </div>
          </td>
          <td class="doc-title-container" style="width: 40%;">
            <div class="doc-title">${docTitle}</div>
            <table class="doc-info" style="margin-left: auto; text-align: right;">
              <tr>
                <td style="font-weight: bold; padding-right: 10px;">Date:</td>
                <td>${docDate}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding-right: 10px;">Doc No.:</td>
                <td>${docNo}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding-right: 10px;">${refLabel}</td>
                <td>${docRef}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <hr />

      <table class="info-table" style="width: 100%;">
        <tr>
          <td style="width: 50%;">
            <span class="info-label">${partyLabel}</span><br/>
            <span style="font-size: 13px; font-weight: bold;">${customerName}</span>
          </td>
          <td style="width: 50%; padding-left: 20px;">
            <table style="width: 100%;">
              <tr>
                <td class="info-label">Driver Name:</td>
                <td>${driverName || '-'}</td>
              </tr>
              <tr>
                <td class="info-label">Vehicle No:</td>
                <td>${vehicleNo || '-'}</td>
              </tr>
              <tr>
                <td class="info-label">Sales Person:</td>
                <td>${salesPerson || '-'}</td>
              </tr>
              <tr>
                <td class="info-label">PO No:</td>
                <td>${poNo || '-'}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table class="item-table">
        <thead>
          ${
            isDeliveryOrGRN
              ? `
              <tr>
                <th style="width: 10%;" class="text-center">S.No</th>
                <th style="width: 60%;">Description</th>
                <th style="width: 15%;" class="text-center">Unit</th>
                <th style="width: 15%;" class="text-right">Qty</th>
              </tr>
              `
              : `
              <tr>
                <th style="width: 8%;" class="text-center">S.No</th>
                <th style="width: 45%;">Description</th>
                <th style="width: 15%;" class="text-center">Unit</th>
                <th style="width: 10%;" class="text-right">Qty</th>
                <th style="width: 10%;" class="text-right">Price</th>
                <th style="width: 12%;" class="text-right">Total</th>
              </tr>
              `
          }
        </thead>
        <tbody>
          ${itemRows}
          ${
            isDeliveryOrGRN
              ? `
              <tr style="font-weight: bold; background-color: #f5f5f5;">
                <td colspan="3" class="text-center">TOTAL</td>
                <td class="text-right">${totalQty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}</td>
              </tr>
              `
              : `
              <tr style="font-weight: bold; background-color: #f5f5f5;">
                <td colspan="3" class="text-center">TOTAL</td>
                <td class="text-right">${totalQty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}</td>
                <td></td>
                <td class="text-right">${totalAmount}</td>
              </tr>
              `
          }
        </tbody>
      </table>

      <table class="footer-signatures" style="width: 100%;">
        <tr>
          <td style="width: 33.3%;">
            <div class="signature-line"></div>
            Prepared By
          </td>
          <td style="width: 33.3%;">
            <div class="signature-line"></div>
            Security Check By
          </td>
          <td style="width: 33.3%;">
            <div class="signature-line"></div>
            Received By
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const fileName = `${docTitle.replace(
    /[^a-zA-Z0-9_]/g,
    '_',
  )}_${docNo}_${Date.now()}`;
  const options = {
    html: htmlContent,
    fileName,
    directory: 'Documents',
  };

  const file = await RNHTMLtoPDF.convert(options);
  console.log('PDF path for sharing:', file.filePath);

  if (Platform.OS === 'android') {
    const base64Data = await RNFS.readFile(file.filePath, 'base64');
    const cleanBase64 = base64Data.replace(/(\r\n|\n|\r)/gm, '');
    await Share.open({
      url: `data:application/pdf;base64,${cleanBase64}`,
      type: 'application/pdf',
      filename: fileName,
      title: `Share ${selectedVoucherTitle || 'Voucher'}`,
      useInternalStorage: true,
    });
  } else {
    await Share.open({
      url: 'file://' + file.filePath,
      type: 'application/pdf',
      title: `Share ${selectedVoucherTitle || 'Voucher'}`,
    });
  }
};
