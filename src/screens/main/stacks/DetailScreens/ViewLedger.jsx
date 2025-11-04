import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Dropdown} from 'react-native-element-dropdown';
import BASEURL from '../../../../utils/BaseUrl';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import {generateLedgerPDF} from '.././../../../components/LedgerPDFGenerator';

const ViewLedger = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [runningBalance, setRunningBalance] = useState(0);

  // Filter states
  const [accounts, setAccounts] = useState([]);
  const [counterParties, setCounterParties] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCounterParty, setSelectedCounterParty] = useState(null);
  const [fromDate, setFromDate] = useState(
    moment().subtract(1, 'month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));

  // Loading states
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [counterPartiesLoading, setCounterPartiesLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [transactionBalances, setTransactionBalances] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Fetch accounts for 1st dropdown
  const fetchAccounts = async () => {
    try {
      setAccountsLoading(true);
      const response = await fetch(`${BASEURL}get_gl_account.php`);
      const json = await response.json();

      if (json.status === 'true' && Array.isArray(json.data)) {
        const formattedAccounts = json.data.map(account => ({
          label: `${account.account_code} - ${account.account_name}`,
          value: account.account_code,
          account_name: account.account_name,
          inactive: account.inactive,
        }));
        setAccounts(formattedAccounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  };

  // Fetch counter parties for 2nd dropdown
  const fetchCounterParties = async (type = '-1', account = '') => {
    if (!selectedAccount) {
      console.log('Please select account first');
      return;
    }

    try {
      setCounterPartiesLoading(true);
      const requestBody = {
        type: type,
        account: selectedAccount.value,
      };

      const response = await fetch(`${BASEURL}get_counter_party.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const json = await response.json();

      if (json.status === 'true' && Array.isArray(json.data)) {
        const formattedCounterParties = json.data.map(party => ({
          label: party.name,
          value: party.id,
          name: party.name,
          inactive: party.inactive,
        }));
        setCounterParties(formattedCounterParties);
      } else {
        setCounterParties([]);
      }
    } catch (error) {
      console.error('Error fetching counter parties:', error);
      setCounterParties([]);
    } finally {
      setCounterPartiesLoading(false);
    }
  };

  // Fetch ledger data with filters
  const fetchData = async () => {
    if (!selectedAccount) {
      console.log('Please select an account first');
      return;
    }

    try {
      setLoading(true);
      const requestBody = {
        account: selectedAccount.value,
        date_from: fromDate,
        date_to: toDate,
        type: '-1',
        person_id: selectedCounterParty ? selectedCounterParty.value : '',
      };

      const response = await fetch(`${BASEURL}gl_account_inquiry.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const json = await response.json();

      if (json.status === 'true') {
        // Set opening balance (null ko 0 karo)
        const opening = json.opening !== null ? parseFloat(json.opening) : 0;
        setOpeningBalance(opening);

        if (Array.isArray(json.data)) {
          const grouped = groupByDate(json.data);
          setLedgerData(grouped);

          // Calculate running balances
          calculateRunningBalances(json.data, opening);

          // Calculate closing balance
          let currentBalance = opening;
          json.data.forEach(item => {
            currentBalance += parseFloat(item.amount);
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
    return Object.keys(groupedData).map(date => ({
      date,
      transactions: groupedData[date],
    }));
  };

  const handleDownload = async () => {
    await generateLedgerPDF(ledgerData, setDownloadLoading);
  };

  const handleApplyFilter = () => {
    fetchData();
  };

  const handleAccountChange = account => {
    setSelectedAccount(account);
    setSelectedCounterParty(null); // Reset counter party when account changes
    if (account) {
      fetchCounterParties('-1', account.value);
    }
  };

  const renderTransaction = ({item, index}) => {
    const isCredit = parseFloat(item.amount) > 0;
    const amount = parseFloat(item.amount);
    const currentBalance = transactionBalances[index] || closingBalance;

    return (
      <Animated.View style={[styles.card, {opacity: fadeAnim}]}>
        <View style={styles.transactionContent}>
          <View style={styles.transactionDetails}>
            {item.reference && (
              <Text style={styles.refText}>{item.reference}</Text>
            )}
            {item.person_name && (
              <Text style={styles.personText}>{item.person_name}</Text>
            )}
            {item.memo && <Text style={styles.memoText}>{item.memo}</Text>}
          </View>

          <View style={styles.amountSection}>
            <Text
              style={[
                styles.amountText,
                {color: isCredit ? '#009900' : '#FF0000'},
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

  const renderSection = ({item}) => {
    return (
      <View>
        <Text style={styles.dateHeader}>
          {moment(item.date).format('dddd, DD MMM YYYY')}
        </Text>
        {item.transactions.map((tx, index) => (
          <View key={index}>{renderTransaction({item: tx, index})}</View>
        ))}
      </View>
    );
  };

  if (loading && ledgerData.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={APPCOLORS.BLACK} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={APPCOLORS.WHITE} />

      {/* Custom Header */}
      <LinearGradient
        colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
        style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={APPCOLORS.WHITE} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>View Transactions</Text>

        <TouchableOpacity onPress={handleDownload} disabled={downloadLoading}>
          {downloadLoading ? (
            <ActivityIndicator size="small" color={APPCOLORS.WHITE} />
          ) : (
            <MaterialIcons
              name="file-download"
              size={26}
              color={APPCOLORS.WHITE}
            />
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        {/* 1st Dropdown - Accounts */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Account *</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={accounts}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={accountsLoading ? 'Loading...' : 'Select Account'}
            searchPlaceholder="Search accounts..."
            value={selectedAccount}
            onChange={handleAccountChange}
            renderLeftIcon={() =>
              accountsLoading ? (
                <ActivityIndicator size="small" color={APPCOLORS.Primary} />
              ) : (
                <MaterialIcons
                  name="account-balance"
                  size={20}
                  color={APPCOLORS.Primary}
                />
              )
            }
          />
        </View>

        {/* 2nd Dropdown - Counter Parties */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Counter Party</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={counterParties}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={
              counterPartiesLoading ? 'Loading...' : 'Select Counter Party'
            }
            searchPlaceholder="Search counter parties..."
            value={selectedCounterParty}
            onChange={setSelectedCounterParty}
            renderLeftIcon={() =>
              counterPartiesLoading ? (
                <ActivityIndicator size="small" color={APPCOLORS.Primary} />
              ) : (
                <MaterialIcons
                  name="people"
                  size={20}
                  color={APPCOLORS.Primary}
                />
              )
            }
            disable={!selectedAccount}
          />
        </View>

        {/* Date Filters */}
        <View style={styles.filterRow}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.filterLabel}>From Date</Text>
            <TextInput
              style={styles.dateInput}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.dateInputContainer}>
            <Text style={styles.filterLabel}>To Date</Text>
            <TextInput
              style={styles.dateInput}
              value={toDate}
              onChangeText={setToDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilter}>
            <MaterialIcons name="search" size={20} color={APPCOLORS.WHITE} />
          </TouchableOpacity>
        </View>

        {/* Opening Balance */}
        {selectedAccount && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Opening Balance:</Text>
            <Text style={styles.balanceValue}>
              ${openingBalance.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <Animated.ScrollView
        style={[styles.container, {opacity: fadeAnim}]}
        showsVerticalScrollIndicator={false}>
        {ledgerData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {selectedAccount
                ? 'No transactions found'
                : 'Please select an account to view transactions'}
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={ledgerData}
              renderItem={renderSection}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />

            {/* Closing Balance */}
            <View style={styles.closingBalanceContainer}>
              <Text style={styles.closingBalanceLabel}>Closing Balance:</Text>
              <Text style={styles.closingBalanceValue}>
                ${closingBalance.toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
};

export default ViewLedger;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: APPCOLORS.WHITE,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 80,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: APPCOLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: APPCOLORS.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APPCOLORS.TEXTFIELDCOLOR,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: APPCOLORS.BLACK,
    marginBottom: 4,
  },
  dropdown: {
    height: 50,
    borderColor: APPCOLORS.TEXTFIELDCOLOR,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: APPCOLORS.WHITE,
  },
  placeholderStyle: {
    fontSize: 14,
    color: APPCOLORS.Secondary,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: APPCOLORS.BLACK,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    borderRadius: 8,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dateInputContainer: {
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: APPCOLORS.TEXTFIELDCOLOR,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: APPCOLORS.WHITE,
  },
  applyButton: {
    backgroundColor: APPCOLORS.Primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: APPCOLORS.CLOSETOWHITE,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: APPCOLORS.BLACK,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APPCOLORS.Primary,
  },
  container: {
    flex: 1,
    padding: 12,
  },
  dateHeader: {
    fontSize: 15,
    color: APPCOLORS.BLACK,
    fontWeight: 'bold',
    marginVertical: 10,
    backgroundColor: APPCOLORS.CLOSETOWHITE,
    padding: 8,
    borderRadius: 6,
  },
  card: {
    backgroundColor: APPCOLORS.WHITE,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  personText: {
    color: '#333',
    fontSize: 13,
    marginBottom: 8,
  },
  memoText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 12,
    color: APPCOLORS.Secondary,
  },
  closingBalanceContainer: {
    backgroundColor: APPCOLORS.Primary,
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closingBalanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APPCOLORS.WHITE,
  },
  closingBalanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APPCOLORS.WHITE,
  },
  loader: {
    flex: 1,
    backgroundColor: APPCOLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noDataText: {
    fontSize: 16,
    color: APPCOLORS.Secondary,
    textAlign: 'center',
  },
});
