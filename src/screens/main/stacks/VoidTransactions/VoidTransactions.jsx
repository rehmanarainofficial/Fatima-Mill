import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import {shareVoidTransactionPDF} from '../../../../components/VoidPDFGenerator';
import {useSelector} from 'react-redux';
import Header from '../../../../components/Header';
import BASEURL from '../../../../utils/BaseUrl';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';

const VOUCHER_TYPES = [
  {id: 0, title: 'Journal Entry', icon: 'document-text-outline'},
  {id: 1, title: 'Bank Payment', icon: 'cash-outline'},
  {id: 2, title: 'Bank Deposit', icon: 'wallet-outline'},
  {id: 41, title: 'Cash Payment', icon: 'cash-outline'},
  {id: 42, title: 'Cash Receipt', icon: 'receipt-outline'},
  {id: 4, title: 'Funds Transfer', icon: 'swap-horizontal-outline'},
  {id: 10, title: 'Sales Invoice', icon: 'document-outline'},
  {id: 11, title: 'Customer Credit Note', icon: 'return-down-back-outline'},
  {id: 12, title: 'Customer Payment', icon: 'card-outline'},
  {id: 13, title: 'Delivery Note', icon: 'car-outline'},
  {id: 16, title: 'Location Transfer', icon: 'location-outline'},
  {id: 17, title: 'Inventory Adjustment', icon: 'construct-outline'},
  {id: 20, title: 'Supplier Invoice', icon: 'document-text-outline'},
  {id: 21, title: 'Supplier Credit Note', icon: 'return-down-forward-outline'},
  {id: 43, title: 'Import Invoice', icon: 'airplane-outline'},
  {id: 22, title: 'Supplier Payment', icon: 'card-outline'},
  {id: 25, title: 'GRN', icon: 'cube-outline'},
  {id: 26, title: 'Work Order', icon: 'hammer-outline'},
  {id: 28, title: 'Work Order Issue', icon: 'arrow-redo-outline'},
  {id: 29, title: 'Work Order Production', icon: 'cog-outline'},
  {id: 35, title: 'Cost Update', icon: 'pricetag-outline'},
];

const VoidTransactions = ({navigation}) => {
  const {currentData} = useSelector(state => state.Data || {});

  // Selected state
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Filters state
  const [fromDate, setFromDate] = useState(
    new Date(moment().subtract(1, 'month')),
  );
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Search details
  const [searchName, setSearchName] = useState('');
  const [reference, setReference] = useState('');
  const [transNo, setTransNo] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Data & loaders
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
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

  const handleSharePDF = async item => {
    setIsSharing(true);
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        setIsSharing(false);
        return;
      }

      // Fetch detail data from API
      const payload = new FormData();
      payload.append('trans_no', item.trans_no.toString());
      payload.append('type', selectedVoucher?.id.toString());

      const res = await axios.post(`${BASEURL}view_data.php`, payload, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      console.log('Fetched Detail Data for Share:', res.data);

      if (!res.data || !res.data.data_header?.[0]) {
        const keys = res.data ? Object.keys(res.data).join(', ') : 'null';
        const msg = `Keys: ${keys} | Type: ${selectedVoucher?.id} | No: ${item.trans_no}`;
        Toast.show({
          type: 'error',
          text1: 'No Details Found',
          text2: msg,
        });
        setIsSharing(false);
        return;
      }

      const header = res.data.data_header[0];
      const details = res.data.data_detail || [];

      // Call external PDF generator & sharing helper
      await shareVoidTransactionPDF(
        item,
        header,
        details,
        selectedVoucher?.title,
        selectedVoucher?.id,
        currentData?.company_name,
      );
    } catch (err) {
      console.log('Share Error:', err);
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: err.message || 'Could not generate or share PDF.',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const formatDateForAPI = date => {
    if (!date) {
      return '';
    }
    return moment(date).format('YYYY-MM-DD');
  };

  const formatDateDisplay = dateStr => {
    if (!dateStr) {
      return '';
    }
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      return dateStr;
    }
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const resetSearchState = () => {
    setSearchName('');
    setReference('');
    setTransNo('');
    setTableData([]);
    setIsFilterExpanded(true);
  };

  const handleVoucherPress = voucher => {
    resetSearchState();
    setSelectedVoucher(voucher);
    handleSearch(voucher.id);
  };

  const handleSearch = async (typeOverride = null) => {
    const type = typeOverride !== null ? typeOverride : selectedVoucher?.id;
    if (type === undefined) {
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('from_date', formatDateForAPI(fromDate));
      fd.append('to_date', formatDateForAPI(toDate));
      fd.append('type', type);
      fd.append('ref', reference);
      fd.append('trans_no', transNo);
      if (searchName.trim()) {
        fd.append('name', searchName.trim());
      }

      const res = await axios.post(`${BASEURL}void_transaction_data.php`, fd, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      console.log(res.data);

      if (res.data?.status === 'true' || res.data?.status === true) {
        setTableData(res.data.data || []);
      } else {
        setTableData([]);
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'No records found for the selected criteria.',
        });
      }
    } catch (error) {
      console.log('Search Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch transaction data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFromDate(new Date(moment().subtract(1, 'month')));
    setToDate(new Date());
    setSearchName('');
    setReference('');
    setTransNo('');
    // Trigger search with cleared filters
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const getFilteredData = () => {
    if (!tableData || tableData.length === 0) {
      return [];
    }
    const nameQuery = searchName.trim().toLowerCase();
    const refQuery = reference.trim().toLowerCase();
    const transQuery = transNo.trim();

    return tableData.filter(item => {
      const partyName = (
        item.name ||
        item.person_name ||
        item.customer_name ||
        item.supp_name ||
        item.debtor_name ||
        ''
      ).toLowerCase();
      const ref = (item.reference || '').toLowerCase();
      const tNo = item.trans_no ? item.trans_no.toString() : '';

      const matchName = !nameQuery || partyName.includes(nameQuery);
      const matchRef = !refQuery || ref.includes(refQuery);
      const matchTrans = !transQuery || tNo.includes(transQuery);

      return matchName && matchRef && matchTrans;
    });
  };

  const renderGrid = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {VOUCHER_TYPES.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.voucherCard}
            activeOpacity={0.7}
            onPress={() => handleVoucherPress(item)}>
            <View style={styles.iconContainer}>
              <Icon
                name={item.icon || 'document-outline'}
                size={24}
                color={APPCOLORS.Primary}
              />
            </View>
            <Text style={styles.voucherCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderRecordCard = ({item}) => {
    const partyName =
      item.name ||
      item.person_name ||
      item.customer_name ||
      item.supp_name ||
      item.debtor_name ||
      '';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.recordCard}
        onPress={() =>
          navigation.navigate('VoidTransactionDetail', {
            trans_no: item.trans_no,
            type: selectedVoucher?.id,
            title: selectedVoucher?.title,
          })
        }>
        {/* Top Header Row: Trans No Badge, Date, and Action Buttons */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.transBadge}>
            <Text style={styles.transBadgeText}>#{item.trans_no}</Text>
          </View>

          <View style={styles.dateChip}>
            <Icon
              name="calendar-outline"
              size={14}
              color="#666"
              style={{marginRight: 4}}
            />
            <Text style={styles.dateChipText}>
              {formatDateDisplay(item.ord_date || item.trans_date)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActionButtons}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('VoidTransactionDetail', {
                  trans_no: item.trans_no,
                  type: selectedVoucher?.id,
                  title: selectedVoucher?.title,
                })
              }
              style={[styles.actionBtn, {backgroundColor: '#E3F2FD'}]}>
              <Icon name="eye-outline" size={18} color="#0784B5" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSharePDF(item)}
              style={[styles.actionBtn, {backgroundColor: '#E8F5E9'}]}>
              <Icon name="share-social-outline" size={18} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Party Name Row */}
        {partyName ? (
          <View style={styles.nameRow}>
            <Icon
              name="person-outline"
              size={16}
              color={APPCOLORS.Primary}
              style={styles.nameIcon}
            />
            <Text style={styles.nameText} numberOfLines={2}>
              {partyName}
            </Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Bottom Row: Reference and Total */}
        <View style={styles.cardBottomRow}>
          <View style={styles.referenceContainer}>
            <Text style={styles.fieldLabel}>Reference</Text>
            <Text style={styles.referenceText} numberOfLines={1}>
              {item.reference || '-'}
            </Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.fieldLabel}>Total</Text>
            <Text style={styles.totalText}>
              {parseFloat(item.total || 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterSection = () => (
    <View style={styles.filterSectionCard}>
      {/* Expand / Collapse Header */}
      <TouchableOpacity
        style={styles.filterToggleHeader}
        activeOpacity={0.7}
        onPress={() => setIsFilterExpanded(!isFilterExpanded)}>
        <View style={styles.filterToggleLeft}>
          <Icon name="funnel-outline" size={18} color={APPCOLORS.Primary} />
          <Text style={styles.filterToggleTitle}>Filters & Search</Text>
          {(searchName || reference || transNo) && (
            <View style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterBadgeText}>Active</Text>
            </View>
          )}
        </View>
        <View style={styles.filterToggleRight}>
          <Text style={styles.filterToggleActionText}>
            {isFilterExpanded ? 'Collapse' : 'Expand'}
          </Text>
          <Icon
            name={isFilterExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={APPCOLORS.Primary}
          />
        </View>
      </TouchableOpacity>

      {/* Collapsible Filter Body */}
      {isFilterExpanded && (
        <View style={styles.filterBody}>
          {/* Date Range Row */}
          <View style={styles.dateFilterContainer}>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowFromPicker(true)}
              activeOpacity={0.7}>
              <Icon
                name="calendar-outline"
                size={16}
                color={APPCOLORS.Primary}
              />
              <Text style={styles.dateText}>
                {moment(fromDate).format('DD MMM YYYY')}
              </Text>
            </TouchableOpacity>

            <Icon name="arrow-forward" size={14} color="#999" />

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowToPicker(true)}
              activeOpacity={0.7}>
              <Icon
                name="calendar-outline"
                size={16}
                color={APPCOLORS.Primary}
              />
              <Text style={styles.dateText}>
                {moment(toDate).format('DD MMM YYYY')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => handleSearch()}
              activeOpacity={0.8}>
              <Icon name="search-outline" size={18} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearFilters}
              activeOpacity={0.8}>
              <Icon name="close-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Search by Name Input */}
          <View style={styles.nameInputWrapper}>
            <Icon
              name="person-outline"
              size={18}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Search by Name..."
              placeholderTextColor="#999"
              value={searchName}
              onChangeText={setSearchName}
              style={styles.textInput}
            />
            {searchName ? (
              <TouchableOpacity onPress={() => setSearchName('')}>
                <Icon name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Reference & Trans No Row */}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Icon
                name="search-outline"
                size={16}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Reference"
                placeholderTextColor="#999"
                value={reference}
                onChangeText={setReference}
                style={styles.textInput}
              />
              {reference ? (
                <TouchableOpacity onPress={() => setReference('')}>
                  <Icon name="close-circle" size={16} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.inputWrapper}>
              <Icon
                name="barcode-outline"
                size={16}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Trans No"
                placeholderTextColor="#999"
                value={transNo}
                onChangeText={setTransNo}
                keyboardType="numeric"
                style={styles.textInput}
              />
              {transNo ? (
                <TouchableOpacity onPress={() => setTransNo('')}>
                  <Icon name="close-circle" size={16} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      )}

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) {
              setFromDate(selectedDate);
            }
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) {
              setToDate(selectedDate);
            }
          }}
        />
      )}
    </View>
  );

  const filteredRecords = getFilteredData();

  const renderTransactionListView = () => (
    <FlatList
      data={filteredRecords}
      keyExtractor={(item, index) => `${item?.trans_no || 'item'}_${index}`}
      ListHeaderComponent={
        <>
          {renderFilterSection()}
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={APPCOLORS.Primary} />
              <Text style={styles.loaderText}>Loading data...</Text>
            </View>
          )}
          {!isLoading && filteredRecords.length > 0 && (
            <View style={styles.recordsCountRow}>
              <Text style={styles.recordsCountText}>
                Showing {filteredRecords.length} record
                {filteredRecords.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </>
      }
      renderItem={renderRecordCard}
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        !isLoading && (
          <View style={styles.emptyContainer}>
            <Icon
              name="document-text-outline"
              size={48}
              color="#B0BEC5"
              style={{marginBottom: 10}}
            />
            <Text style={styles.emptyText}>No records found</Text>
            <Text style={styles.emptySubText}>
              Try adjusting your date range or search filters
            </Text>
          </View>
        )
      }
    />
  );

  return (
    <View style={styles.container}>
      <Header
        title={selectedVoucher ? selectedVoucher.title : 'Void Transactions'}
        onBack={() => {
          if (selectedVoucher) {
            resetSearchState();
            setSelectedVoucher(null);
          } else {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Dashboard');
            }
          }
        }}
      />

      {selectedVoucher ? renderTransactionListView() : renderGrid()}

      {isSharing && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.sharingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.sharingText}>Generating PDF & Sharing...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  voucherCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(7, 132, 181, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  voucherCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  listContentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  filterSectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  filterToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFCFD',
  },
  filterToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: APPCOLORS.BLACK,
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(7, 132, 181, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeFilterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: APPCOLORS.Primary,
  },
  filterToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterToggleActionText: {
    fontSize: 12,
    color: APPCOLORS.Primary,
    fontWeight: '600',
  },
  filterBody: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 10,
  },
  dateBox: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    height: 42,
    paddingHorizontal: 8,
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: APPCOLORS.Primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingHorizontal: 10,
    height: 42,
  },
  inputIcon: {
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    padding: 0,
  },
  recordsCountRow: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  recordsCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transBadge: {
    backgroundColor: 'rgba(7, 132, 181, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: APPCOLORS.Primary,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateChipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  cardActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nameIcon: {
    marginRight: 6,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  referenceContainer: {
    flex: 1.5,
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  referenceText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '500',
  },
  totalContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '800',
    color: APPCOLORS.Primary,
  },
  loaderContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#666',
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  emptySubText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  sharingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharingText: {
    marginTop: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default VoidTransactions;
