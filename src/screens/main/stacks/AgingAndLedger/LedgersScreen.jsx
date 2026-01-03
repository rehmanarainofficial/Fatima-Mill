import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import BASEURL from '../../../../utils/BaseUrl';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import { generateLedgerPDF } from '.././../../../components/LedgerPDFGenerator';

const LedgersScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { item, type } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  // Filter states - sirf dates ke liye
  const [fromDate, setFromDate] = useState(
    moment().subtract(1, 'month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));

  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [transactionBalances, setTransactionBalances] = useState({});

  useEffect(() => {
    if (item) {
      fetchData();
    }
  }, [item]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Fetch ledger data with filters - FORM DATA with POST
  const fetchData = async () => {
    try {
      if (!item) return;

      setLoading(true);

      const formData = new FormData();
      formData.append('account', item.account);
      formData.append('from_date', fromDate);
      formData.append('to_date', toDate);
      formData.append('person_id', type == 'Bank & Cash' ? '' : item.person_id);

      const response = await fetch(`${BASEURL}gl_account_inquiry.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const json = await response.json();

      if (json.status === 'true') {
        const opening = json.opening !== null ? parseFloat(json.opening) : 0;
        setOpeningBalance(opening);

        if (Array.isArray(json.data) && json.data.length > 0) {
          const grouped = groupByDate(json.data);
          setLedgerData(grouped);

          calculateRunningBalances(json.data, opening);

          let currentBalance = opening;
          json.data.forEach(item => {
            currentBalance += parseFloat(item.amount);
          });
          setClosingBalance(currentBalance);
        } else {
          console.log('No transactions array found');
          setLedgerData([]);
          setClosingBalance(opening);
          setTransactionBalances({});
        }
      } else {
        console.log('API status false');
        setLedgerData([]);
        setOpeningBalance(0);
        setClosingBalance(0);
        setTransactionBalances({});
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRunningBalances = (transactions, openingBalance) => {
    let currentBalance = openingBalance;
    const balances = {};

    transactions.forEach((transaction, index) => {
      currentBalance += parseFloat(transaction.amount);
      balances[index] = currentBalance;
    });

    setTransactionBalances(balances);
  };

  const groupByDate = data => {
    const groupedData = {};
    data.forEach(item => {
      const date = item.doc_date;
      if (!groupedData[date]) groupedData[date] = [];
      groupedData[date].push(item);
    });

    const result = Object.keys(groupedData).map(date => ({
      date,
      transactions: groupedData[date],
    }));

    return result;
  };

  // Global transaction index finder
  const findGlobalTransactionIndex = (sectionIndex, transactionIndex) => {
    let globalIndex = 0;

    for (let i = 0; i < sectionIndex; i++) {
      if (ledgerData[i] && ledgerData[i].transactions) {
        globalIndex += ledgerData[i].transactions.length;
      }
    }

    globalIndex += transactionIndex;
    return globalIndex;
  };

  const handleDownload = async () => {
    await generateLedgerPDF(ledgerData, setDownloadLoading, fromDate, toDate);
  };

  const handleApplyFilter = () => {
    fetchData();
  };

  const handleResetFilter = () => {
    setFromDate(moment().subtract(1, 'month').format('YYYY-MM-DD'));
    setToDate(moment().format('YYYY-MM-DD'));
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  // Date picker handlers
  const onFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setToDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const showFromDatepicker = () => {
    setShowFromDatePicker(true);
  };

  const showToDatepicker = () => {
    setShowToDatePicker(true);
  };

  const renderTransaction = (transaction, sectionIndex, transactionIndex) => {
    const globalIndex = findGlobalTransactionIndex(
      sectionIndex,
      transactionIndex,
    );
    const isCredit = parseFloat(transaction.amount) > 0;
    const amount = parseFloat(transaction.amount);
    const currentBalance = transactionBalances[globalIndex] || closingBalance;

    return (
      <Animated.View
        key={`${sectionIndex}-${transactionIndex}`}
        style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.transactionContent}>
          <View style={styles.transactionDetails}>
            {transaction.reference && (
              <Text style={styles.refText}>{transaction.reference}</Text>
            )}
            {transaction.person_name && (
              <Text style={styles.personText}>{transaction.person_name}</Text>
            )}
            {transaction.memo && (
              <Text style={styles.memoText}>{transaction.memo}</Text>
            )}
          </View>

          <View style={styles.amountSection}>
            <Text
              style={[
                styles.amountText,
                { color: isCredit ? '#009900' : '#FF0000' },
              ]}>
              {isCredit ? '+' : '-'}
              {Math.abs(amount).toFixed(2)}
            </Text>
            <Text style={styles.balanceText}>
              Balance: {currentBalance.toFixed(2)}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSection = ({ item: section, index: sectionIndex }) => {
    if (!section.transactions || !Array.isArray(section.transactions)) {
      return null;
    }

    return (
      <View key={`section-${sectionIndex}`}>
        <Text style={styles.dateHeader}>
          {moment(section.date).format('dddd, DD MMM YYYY')}
        </Text>
        {section.transactions.map((transaction, transactionIndex) =>
          renderTransaction(transaction, sectionIndex, transactionIndex),
        )}
      </View>
    );
  };

  // Simple key extractor
  const keyExtractor = (item, index) => {
    return `section-${index}-${item.date}`;
  };

  if (loading && ledgerData.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={APPCOLORS.Primary} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
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
          {item?.name || 'Ledger Transactions'}
        </Text>

        <TouchableOpacity
          onPress={handleDownload}
          style={{ padding: 5 }}
          disabled={downloadLoading || ledgerData.length === 0}>
          {downloadLoading ? (
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

      {/* Compact Filter Section - Sirf dates aur buttons */}
      <View style={styles.filterContainer}>
        {/* Dates & Action Buttons Row */}
        <View style={styles.filterRow}>
          {/* From Date */}
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={showFromDatepicker}>
              <Text
                style={[styles.dateText, !fromDate && styles.placeholderText]}>
                {fromDate || 'From Date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* To Date */}
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={showToDatepicker}>
              <Text
                style={[styles.dateText, !toDate && styles.placeholderText]}>
                {toDate || 'To Date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* Reset Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilter}>
              <MaterialIcons
                name="refresh"
                size={20}
                color={APPCOLORS.Primary}
              />
            </TouchableOpacity>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilter}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={APPCOLORS.WHITE} />
              ) : (
                <MaterialIcons
                  name="search"
                  size={20}
                  color={APPCOLORS.WHITE}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Pickers */}
        {Platform.OS === 'ios' ? (
          <>
            <Modal
              visible={showFromDatePicker}
              transparent={true}
              animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select From Date</Text>
                    <TouchableOpacity onPress={() => setShowFromDatePicker(false)}>
                      <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={new Date(fromDate)}
                    mode="date"
                    display="inline"
                    onChange={onFromDateChange}
                  />
                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setShowFromDatePicker(false)}>
                    <Text style={styles.closeModalButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              visible={showToDatePicker}
              transparent={true}
              animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select To Date</Text>
                    <TouchableOpacity onPress={() => setShowToDatePicker(false)}>
                      <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={new Date(toDate)}
                    mode="date"
                    display="inline"
                    onChange={onToDateChange}
                  />
                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setShowToDatePicker(false)}>
                    <Text style={styles.closeModalButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <>
            {showFromDatePicker && (
              <DateTimePicker
                value={new Date(fromDate)}
                mode="date"
                display="default"
                onChange={onFromDateChange}
              />
            )}
            {showToDatePicker && (
              <DateTimePicker
                value={new Date(toDate)}
                mode="date"
                display="default"
                onChange={onToDateChange}
              />
            )}
          </>
        )}

        {/* Balance Information */}
        {item && (
          <View style={styles.balanceContainer}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Opening Balance</Text>
              <Text style={styles.balanceValue}>
                {openingBalance.toFixed(2)}
              </Text>
            </View>
            {ledgerData.length > 0 && (
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Closing Balance</Text>
                <Text style={styles.balanceValue}>
                  {closingBalance.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Transactions List */}
      <View style={styles.container}>
        {ledgerData.length > 0 ? (
          <FlatList
            data={ledgerData}
            renderItem={renderSection}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons
              name="receipt-long"
              size={60}
              color={APPCOLORS.TEXTFIELDCOLOR}
            />
            <Text style={styles.noDataText}>
              {loading
                ? 'Loading transactions...'
                : item
                  ? 'No transactions found for selected period'
                  : 'No data available'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default LedgersScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
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
  filterContainer: {
    backgroundColor: '#F0F2F5',
    padding: responsiveWidth(4),
    margin: responsiveWidth(3),
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1.5),
    gap: responsiveWidth(2.5),
  },
  dateContainer: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    width: responsiveWidth(25),
    gap: responsiveWidth(2),
  },
  dateInput: {
    justifyContent: 'center',
    borderRadius: 12,
    padding: responsiveWidth(3.5),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    height: responsiveHeight(6),
  },
  dateText: {
    fontSize: responsiveFontSize(1.6),
    color: APPCOLORS.BLACK,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  resetButton: {
    backgroundColor: '#E8EAED',
    borderRadius: 12,
    width: responsiveWidth(11),
    height: responsiveHeight(6),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButton: {
    backgroundColor: APPCOLORS.Primary,
    borderRadius: 12,
    width: responsiveWidth(11),
    height: responsiveHeight(6),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: APPCOLORS.Primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  balanceContainer: {
    backgroundColor: '#FFFFFF',
    padding: responsiveWidth(3),
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  balanceInfo: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: 'bold',
    color: APPCOLORS.Primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: responsiveWidth(3),
  },
  listContent: {
    paddingHorizontal: responsiveWidth(2),
    paddingBottom: 20,
  },
  dateHeader: {
    fontSize: responsiveFontSize(1.8),
    color: APPCOLORS.BLACK,
    fontWeight: 'bold',
    marginVertical: responsiveHeight(1.5),
    backgroundColor: '#FFFFFF',
    padding: responsiveWidth(4),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    backgroundColor: APPCOLORS.WHITE,
    borderRadius: 12,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(1),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: APPCOLORS.Primary,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionDetails: {
    flex: 1,
  },
  amountSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  refText: {
    color: APPCOLORS.BLACK,
    fontSize: responsiveFontSize(1.6),
    fontWeight: 'bold',
    marginBottom: 6,
  },
  personText: {
    color: '#4B5563',
    fontSize: responsiveFontSize(1.4),
    marginBottom: 6,
  },
  memoText: {
    color: '#6B7280',
    fontSize: responsiveFontSize(1.3),
    marginTop: 4,
  },
  amountText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: responsiveFontSize(1.4),
    color: '#6B7280',
  },
  loader: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: responsiveFontSize(2),
    color: APPCOLORS.Primary,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: responsiveHeight(8),
  },
  noDataText: {
    fontSize: responsiveFontSize(1.8),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: responsiveWidth(5),
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: responsiveWidth(90),
    paddingBottom: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: '#000',
  },
  closeModalButton: {
    backgroundColor: APPCOLORS.Primary,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: APPCOLORS.WHITE,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(1.8),
  },
});
