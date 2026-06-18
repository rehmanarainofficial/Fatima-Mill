import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import BASEURL from '../../../../utils/BaseUrl';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import Header from '../../../../components/Header';

const VoidTransactionDetail = ({route, navigation}) => {
  const {trans_no, type} = route.params;

  const [showGL, setShowGL] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [glData, setGLData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isGLLoading, setIsGLLoading] = useState(false);



  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trans_no, type]);



  const fetchDetails = async () => {
    const payload = new FormData();
    payload.append('trans_no', trans_no.toString());
    payload.append('type', type.toString());

    // Fetch Transaction Data
    setIsDataLoading(true);
    try {
      const res = await axios.post(`${BASEURL}view_data.php`, payload, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      if (
        res.data &&
        (res.data.status_header === 'true' || res.data.status_header === true)
      ) {
        setTransactionData(res.data);
      } else {
        setTransactionData({empty: true});
      }
    } catch (err) {
      console.log('Fetch Transaction details error:', err);
      setTransactionData({empty: true});
    } finally {
      setIsDataLoading(false);
    }

    // Fetch GL Data
    setIsGLLoading(true);
    try {
      const res = await axios.post(`${BASEURL}view_gl.php`, payload, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      if (
        res.data &&
        (res.data.status_header === 'true' || res.data.status_header === true)
      ) {
        setGLData(res.data);
      } else {
        setGLData({empty: true});
      }
    } catch (err) {
      console.log('Fetch GL details error:', err);
      setGLData({empty: true});
    } finally {
      setIsGLLoading(false);
    }
  };

  const renderHeaderField = (label, value) => {
    if (!value && value !== 0) {return null;}
    return (
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}:</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    );
  };

  const renderEmpty = (message = 'No data available') => (
    <View style={styles.emptyBox}>
      <Icon name="document-outline" size={36} color="#666" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, !showGL && styles.activeTab]}
        onPress={() => setShowGL(false)}>
        <Icon
          name="document-text-outline"
          size={18}
          color={!showGL ? '#FFF' : '#666'}
        />
        <Text style={[styles.tabText, {color: !showGL ? '#FFF' : '#666'}]}>
          Transaction View
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, showGL && styles.activeTab]}
        onPress={() => setShowGL(true)}>
        <Icon
          name="swap-horizontal-outline"
          size={18}
          color={showGL ? '#FFF' : '#666'}
        />
        <Text style={[styles.tabText, {color: showGL ? '#FFF' : '#666'}]}>
          GL View
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionView = () => {
    if (!transactionData) {return null;}

    if (transactionData.empty || !transactionData.data_header?.[0]) {
      return renderEmpty('No transaction data available for this record.');
    }

    const header = transactionData.data_header[0];
    const details = transactionData.data_detail || [];

    const decodeHtml = html => {
      if (!html) {return '';}
      return html
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ');
    };

    return (
      <View style={styles.section}>
        <View style={styles.card}>
          {renderHeaderField('Reference', header.reference)}
          {renderHeaderField('Date', header.trans_date)}
          {renderHeaderField('Due Date', header.due_date)}
          {renderHeaderField('Type', header.type)}
          {renderHeaderField('Name', header.name)}
          {renderHeaderField('Location', header.location_name)}
          {renderHeaderField('Salesman', header.salesman)}
          {renderHeaderField('Customer Ref', header.customer_ref)}
          {renderHeaderField('Payment Terms', header.payment_terms)}
          {renderHeaderField('Total', header.total)}
          {renderHeaderField('Discount', header.discount)}
          {header.comments && (
            <View style={styles.commentBox}>
              <Text style={styles.fieldLabel}>Comments:</Text>
              <Text style={styles.commentText}>{header.comments}</Text>
            </View>
          )}
        </View>

        {details.length > 0 && (
          <View style={styles.itemTable}>
            <Text style={styles.subHeading}>Item Details</Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeaderCell, {flex: 2}]}>
                Description
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {flex: 0.8, textAlign: 'center'},
                ]}>
                Qty
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {flex: 1.2, textAlign: 'right'},
                ]}>
                Price
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {flex: 1.2, textAlign: 'right'},
                ]}>
                Total
              </Text>
            </View>
            {details.map((item, index) => {
              const qty = parseFloat(item.quantity) || 0;
              const price = parseFloat(item.unit_price) || 0;
              const total = qty * price;
              return (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    {
                      borderBottomWidth: 1,
                      borderBottomColor: '#E6E8EB',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    },
                  ]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 2}}>
                      <Text style={styles.tableName}>
                        {decodeHtml(item.description)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.tableCell,
                        {flex: 0.8, textAlign: 'center'},
                      ]}>
                      {qty}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        {flex: 1.2, textAlign: 'right'},
                      ]}>
                      {price.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        {flex: 1.2, textAlign: 'right', fontWeight: '700'},
                      ]}>
                      {total.toLocaleString()}
                    </Text>
                  </View>
                  {item.long_description && (
                    <Text style={[styles.tableSub, {marginTop: 4}]}>
                      {decodeHtml(item.long_description)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderGLView = () => {
    if (!glData) {return null;}

    if (glData.empty || !glData.data_header?.[0]) {
      return renderEmpty('No GL data available for this record.');
    }

    const header = glData.data_header[0];
    const details = glData.data_detail || [];

    return (
      <View style={styles.section}>
        <View style={styles.card}>
          {renderHeaderField('Reference', header.reference)}
          {renderHeaderField('Date', header.trans_date)}
          {renderHeaderField('Name', header.name)}
          {renderHeaderField('User', header.real_name)}
          {renderHeaderField('Cheque No', header.cheque_no)}
          {renderHeaderField('Cheque Date', header.cheque_date)}
          {renderHeaderField('Supp Ref', header.supp_reference)}
        </View>

        {details.length > 0 ? (
          <View style={styles.glTable}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeaderCell, {flex: 2}]}>Account</Text>
              <Text
                style={[styles.tableHeaderCell, {flex: 1, textAlign: 'right'}]}>
                Debit
              </Text>
              <Text
                style={[styles.tableHeaderCell, {flex: 1, textAlign: 'right'}]}>
                Credit
              </Text>
            </View>
            {details.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  {borderBottomWidth: 1, borderBottomColor: '#E6E8EB'},
                ]}>
                <View style={{flex: 2}}>
                  <Text style={styles.tableName}>{item.account_name}</Text>
                  <Text style={styles.tableSub}>{item.account}</Text>
                </View>
                <Text
                  style={[
                    styles.tableCell,
                    {flex: 1, textAlign: 'right', color: '#009900'},
                  ]}>
                  {item.debit && item.debit !== 0 ? item.debit : '-'}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {flex: 1, textAlign: 'right', color: '#FF0000'},
                  ]}>
                  {item.credit && item.credit !== 0
                    ? Math.abs(item.credit)
                    : '-'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            {renderEmpty('No GL entries for this transaction.')}
          </View>
        )}
      </View>
    );
  };

  const isLoading = isDataLoading || isGLLoading;

  return (
    <View style={styles.container}>
      <Header
        title="Transaction Detail"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.headerWrapper}>{renderTabs()}</View>

      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={APPCOLORS.Primary} />
        </View>
      ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {!showGL ? renderTransactionView() : renderGLView()}
          </ScrollView>
      )}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: 4,
    backgroundColor: '#FFF',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#0784B5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F2F5',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    paddingLeft: 20,
  },
  commentBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  commentText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    lineHeight: 18,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginVertical: 12,
  },
  glTable: {
    marginTop: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  itemTable: {
    marginTop: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: 'rgba(7, 132, 181, 0.08)',
    paddingVertical: 10,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0784B5',
    textTransform: 'uppercase',
  },
  tableName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  tableSub: {
    fontSize: 10,
    color: '#666',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  emptyBox: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#666',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },

});

export default VoidTransactionDetail;
