import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../components/Header';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import { GetParentAccountDetail } from '../../../../global/ChartApisCall';

const decodeHtml = str => {
  if (!str) {
    return '';
  }
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
};

const AccountDetailScreen = ({ route, navigation }) => {
  const { title, accountType, fromDate: initialFrom, toDate: initialTo } =
    route.params || {};

  const [fromDate, setFromDate] = useState(
    initialFrom || moment().subtract(30, 'days').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(
    initialTo || moment().format('YYYY-MM-DD'),
  );

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const cleanTitle = useMemo(() => {
    return decodeHtml(title) || 'Account Details';
  }, [title]);

  const fetchData = useCallback(
    async (start = fromDate, end = toDate) => {
      setLoading(true);
      try {
        const res = await GetParentAccountDetail(accountType, start, end);
        if (
          res &&
          (res.status === 'true' || res.status === true) &&
          Array.isArray(res.data)
        ) {
          setTransactions(res.data);
        } else if (Array.isArray(res)) {
          setTransactions(res);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.log('[AccountDetailScreen] API Error:', err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [accountType, fromDate, toDate],
  );

  useEffect(() => {
    fetchData(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType]);

  const handleApplyFilter = () => {
    fetchData(fromDate, toDate);
  };

  const handleResetDateFilter = () => {
    const today = moment().format('YYYY-MM-DD');
    const prev = moment().subtract(30, 'days').format('YYYY-MM-DD');
    setFromDate(prev);
    setToDate(today);
    fetchData(prev, today);
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return transactions;
    }
    const q = searchQuery.toLowerCase().trim();
    return transactions.filter(t => {
      const name = String(t.account_name || t.memo || '').toLowerCase();
      const code = String(t.account_code || t.reference || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [transactions, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const val = parseFloat(String(t.t_amount ?? t.amount ?? '0')) || 0;
      return acc + Math.abs(val);
    }, 0);
  }, [filteredTransactions]);

  const renderItem = ({ item }) => {
    const rawName = item.account_name || item.memo || 'Entry';
    const cleanAccountName = decodeHtml(rawName);
    const amountVal =
      parseFloat(String(item.t_amount ?? item.amount ?? '0')) || 0;
    const code =
      item.account_code ||
      item.account ||
      item.code ||
      item.reference ||
      '';

    return (
      <TouchableOpacity
        style={styles.cardItem}
        activeOpacity={0.7}
        onPress={() => {
          if (code) {
            navigation.navigate('Ledgers', {
              item: {
                account: code,
                account_code: code,
                name: cleanAccountName,
              },
              type: 'Account',
              fromDate,
              toDate,
            });
          }
        }}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardAccountName} numberOfLines={2}>
            {cleanAccountName}
          </Text>
          <View style={styles.cardMetaRow}>
            {code ? (
              <Text style={styles.cardCode}>Account #{code}</Text>
            ) : null}
            <Text style={styles.cardLedgerHint}>Tap to view ledger ›</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardAmount}>
            Rs. {Math.abs(amountVal).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeArea}>
      <Header
        title={cleanTitle}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.dateFilterCard}>
        <Text style={styles.filterCardTitle}>DATE FILTER</Text>
        <View style={styles.dateInputsRow}>
          <TouchableOpacity
            style={styles.dateBox}
            activeOpacity={0.75}
            onPress={() => setShowFromPicker(true)}>
            <Icon
              name="calendar"
              size={18}
              color={APPCOLORS.Primary || '#0784B5'}
            />
            <View style={styles.dateTextWrapper}>
              <Text style={styles.dateLabel}>FROM</Text>
              <Text style={styles.dateValueText}>
                {fromDate ? moment(fromDate).format('DD/MM/YYYY') : ''}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dateArrowBox}>
            <Text style={styles.dateArrowText}>→</Text>
          </View>

          <TouchableOpacity
            style={styles.dateBox}
            activeOpacity={0.75}
            onPress={() => setShowToPicker(true)}>
            <Icon
              name="calendar"
              size={18}
              color={APPCOLORS.Primary || '#0784B5'}
            />
            <View style={styles.dateTextWrapper}>
              <Text style={styles.dateLabel}>TO</Text>
              <Text style={styles.dateValueText}>
                {toDate ? moment(toDate).format('DD/MM/YYYY') : ''}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={styles.applyFilterBtn}
            onPress={handleApplyFilter}
            activeOpacity={0.8}>
            <Text style={styles.applyFilterBtnText}>Apply Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetFilterBtn}
            onPress={handleResetDateFilter}
            activeOpacity={0.8}>
            <Text style={styles.resetFilterBtnText}>Last 30 Days</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryBanner}>
        <Text style={styles.summaryLabel}>TOTAL ACCUMULATED</Text>
        <Text style={styles.summaryTotalValue}>
          Rs. {totalAmount.toLocaleString()}
        </Text>
        <Text style={styles.summaryCount}>
          Showing {filteredTransactions.length} entries
        </Text>
      </View>

      <View style={styles.searchBoxContainer}>
        <Icon name="magnify" size={20} color="#888" style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by account name, ref..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && transactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={APPCOLORS.Primary || '#0784B5'} />
          <Text style={styles.loadingText}>Fetching account details...</Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No transactions found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'No records match your search filter.'
              : 'No entries recorded for this account in the selected date range.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item, index) =>
            `${item.account_code || index}_${item.trans_date || index}_${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchData(fromDate, toDate)}
              colors={[APPCOLORS.Primary || '#0784B5']}
              tintColor={APPCOLORS.Primary || '#0784B5'}
            />
          }
        />
      )}

      {showFromPicker && (
        <DateTimePicker
          value={new Date(fromDate)}
          mode="date"
          display="default"
          onChange={onFromDateChange}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={new Date(toDate)}
          mode="date"
          display="default"
          onChange={onToDateChange}
        />
      )}
    </View>
  );
};

export default AccountDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  dateFilterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(1),
    padding: responsiveWidth(3.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  filterCardTitle: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 8,
    gap: 8,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 0.5,
  },
  dateValueText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
    color: APPCOLORS.BLACK,
  },
  dateArrowBox: {
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  applyFilterBtn: {
    flex: 1,
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyFilterBtnText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(1.5),
    fontWeight: 'bold',
  },
  resetFilterBtn: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetFilterBtnText: {
    color: '#333',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
  },
  summaryBanner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(1),
    padding: responsiveWidth(3.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  summaryLabel: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 0.5,
  },
  summaryTotalValue: {
    fontSize: responsiveFontSize(2.6),
    fontWeight: 'bold',
    color: APPCOLORS.Primary || '#0784B5',
    marginVertical: 4,
  },
  summaryCount: {
    fontSize: responsiveFontSize(1.4),
    color: '#888',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(1),
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveFontSize(1.6),
    color: APPCOLORS.BLACK,
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 16,
    color: '#888',
    paddingHorizontal: 6,
  },
  listContent: {
    paddingHorizontal: responsiveWidth(3),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(5),
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardLeft: {
    flex: 1,
    marginRight: 10,
  },
  cardAccountName: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
    color: APPCOLORS.BLACK,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cardCode: {
    fontSize: responsiveFontSize(1.3),
    color: '#888',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardLedgerHint: {
    fontSize: responsiveFontSize(1.3),
    color: APPCOLORS.Primary || '#0784B5',
    fontWeight: '500',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: 'bold',
    color: APPCOLORS.BLACK,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: responsiveFontSize(1.6),
    color: '#666',
  },
  emptyTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
    color: '#444',
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
  },
});
