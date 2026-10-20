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
import AppDatePicker from '../../../../components/AppDatePicker';
import BASEURL from '../../../../utils/BaseUrl';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import { generateLedgerPDF } from '.././../../../components/LedgerPDFGenerator';
import Header from '../../../../components/Header';

const LedgersScreen = ({ route, navigation }) => {
  const { item, type } = route.params || {};
  const passedFromDate = route.params?.fromDate || item?.fromDate;
  const passedToDate = route.params?.toDate || item?.toDate;
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  const [fromDate, setFromDate] = useState(
    passedFromDate || moment().subtract(1, 'month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(
    passedToDate || moment().format('YYYY-MM-DD'),
  );

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [transactionBalances, setTransactionBalances] = useState({});

  useEffect(() => {
    if (item) {
      fetchData(
        passedFromDate || fromDate,
        passedToDate || toDate,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fetchData = async (overrideFrom = fromDate, overrideTo = toDate) => {
    try {
      if (!item) {return;}

      setLoading(true);

      const accountVal =
        item.account ||
        item.account_code ||
        item.bank_act ||
        item.code ||
        '';

      const formData = new FormData();
      formData.append('account', String(accountVal));
      formData.append('from_date', overrideFrom);
      formData.append('to_date', overrideTo);

      if (
        item.person_id &&
        item.person_id !== 'undefined' &&
        type !== 'Bank & Cash' &&
        type !== 'Account'
      ) {
        formData.append('person_id', String(item.person_id));
      } else {
        formData.append('person_id', '');
      }

      const urls = [
        `${BASEURL}ledger/gl_account_inquiry.php`,
        `${BASEURL}gl_account_inquiry.php`,
      ];

      let json = null;
      for (const url of urls) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          });
          if (response.ok) {
            const parsed = await response.json();
            if (parsed) {
              json = parsed;
              if (parsed.status === 'true' || parsed.status === true) {
                break;
              }
            }
          }
        } catch (e) {
          console.log(e);
        }
      }

      if (json && (json.status === 'true' || json.status === true)) {
        const opening =
          json.opening !== null && json.opening !== undefined
            ? parseFloat(json.opening)
            : 0;
        setOpeningBalance(opening);

        if (Array.isArray(json.data) && json.data.length > 0) {
          const grouped = groupByDate(json.data);
          setLedgerData(grouped);

          calculateRunningBalances(json.data, opening);

          let currentBalance = opening;
          json.data.forEach(t => {
            currentBalance += parseFloat(t.amount || 0);
          });
          setClosingBalance(currentBalance);
        } else {
          setLedgerData([]);
          setClosingBalance(opening);
          setTransactionBalances({});
        }
      } else {
        setLedgerData([]);
        setOpeningBalance(0);
        setClosingBalance(0);
        setTransactionBalances({});
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setLedgerData([]);
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
      const date = item.doc_date || item.trans_date || item.tran_date || 'No Date';
      if (!groupedData[date]) {groupedData[date] = [];}
      groupedData[date].push(item);
    });

    const result = Object.keys(groupedData).map(date => ({
      date,
      transactions: groupedData[date],
    }));

    return result;
  };

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
    fetchData(fromDate, toDate);
  };

  const handleResetFilter = () => {
    const prev = moment().subtract(1, 'month').format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');
    setFromDate(prev);
    setToDate(today);
    fetchData(prev, today);
  };

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
              {Math.abs(amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.balanceText}>
              Balance:{' '}
              {currentBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
          {section.date ? moment(section.date).format('DD/MM/YYYY') : 'N/A'}
        </Text>
        {section.transactions.map((transaction, transactionIndex) =>
          renderTransaction(transaction, sectionIndex, transactionIndex),
        )}
      </View>
    );
  };

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
      <Header
        title={item?.name || 'Ledger Transactions'}
        onBack={() => navigation.goBack()}
        rightElement={
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
        }
      />

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={showFromDatepicker}>
              <Text
                style={[styles.dateText, !fromDate && styles.placeholderText]}>
                {fromDate ? moment(fromDate).format('DD/MM/YYYY') : 'From Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={showToDatepicker}>
              <Text
                style={[styles.dateText, !toDate && styles.placeholderText]}>
                {toDate ? moment(toDate).format('DD/MM/YYYY') : 'To Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilter}>
              <MaterialIcons
                name="refresh"
                size={20}
                color={APPCOLORS.Primary}
              />
            </TouchableOpacity>

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

        <AppDatePicker
          visible={showFromDatePicker}
          value={new Date(fromDate)}
          title="Select From Date"
          onClose={() => setShowFromDatePicker(false)}
          onChange={selectedDate => {
            if (selectedDate) {
              setFromDate(moment(selectedDate).format('YYYY-MM-DD'));
            }
          }}
        />

        <AppDatePicker
          visible={showToDatePicker}
          value={new Date(toDate)}
          title="Select To Date"
          onClose={() => setShowToDatePicker(false)}
          onChange={selectedDate => {
            if (selectedDate) {
              setToDate(moment(selectedDate).format('YYYY-MM-DD'));
            }
          }}
        />

        {item && (
          <View style={styles.balanceContainer}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Opening Balance</Text>
              <Text style={styles.balanceValue}>
                {openingBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            {ledgerData.length > 0 && (
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Closing Balance</Text>
                <Text style={styles.balanceValue}>
                  {closingBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

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
    backgroundColor: '#000000',
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
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: '#FFFFFF',
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
