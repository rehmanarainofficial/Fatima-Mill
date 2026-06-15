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
  useWindowDimensions,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import {responsiveHeight} from '../../../../utils/Responsive';
import {shareVoidTransactionPDF} from '../../../../components/VoidPDFGenerator';

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

import BASEURL from '../../../../utils/BaseUrl';

const VoidTransactions = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

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
  const [reference, setReference] = useState('');
  const [transNo, setTransNo] = useState('');

  // Data & loaders
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {return true;}
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
      await shareVoidTransactionPDF(item, header, details, selectedVoucher?.title);

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
    if (!date) {return '';}
    return moment(date).format('YYYY-MM-DD');
  };

  const formatDateDisplay = dateStr => {
    if (!dateStr) {return '';}
    const parts = dateStr.split('-');
    if (parts.length !== 3) {return dateStr;}
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // dd/mm/yyyy
  };

  const resetSearchState = () => {
    setReference('');
    setTransNo('');
    setTableData([]);
  };

  const handleVoucherPress = voucher => {
    resetSearchState();
    setSelectedVoucher(voucher);
    handleSearch(voucher.id);
  };

  const handleSearch = async (typeOverride = null) => {
    const type = typeOverride !== null ? typeOverride : selectedVoucher?.id;
    if (type === undefined) {return;}

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('from_date', formatDateForAPI(fromDate));
      fd.append('to_date', formatDateForAPI(toDate));
      fd.append('type', type);
      fd.append('ref', reference);
      fd.append('trans_no', transNo);

      const res = await axios.post(`${BASEURL}void_transaction_data.php`, fd, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      console.log(res.data);

      if (
        res.data?.status_unapprove_vouchers_order === 'true' ||
        res.data?.status_unapprove_vouchers_order === true
      ) {
        console.log(res.data);
        setTableData(res.data.data_unapprove_voucher || []);
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
    setReference('');
    setTransNo('');
    // Trigger search with cleared filters
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const renderGrid = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {VOUCHER_TYPES.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleVoucherPress(item)}>
            <View style={styles.iconContainer}>
              <Icon
                name={item.icon || 'document-outline'}
                size={24}
                color={APPCOLORS.Primary}
              />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderTable = () => {
    if (isLoading) {
      return (
        <View style={{marginTop: 40, alignItems: 'center'}}>
          <ActivityIndicator size="large" color={APPCOLORS.Primary} />
          <Text style={{marginTop: 10, color: '#666'}}>Loading data...</Text>
        </View>
      );
    }

    return (
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.cellTrans]}>Trans</Text>
          <Text style={[styles.headerCell, styles.cellRef]}>Reference</Text>
          <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
          <Text
            style={[styles.headerCell, styles.cellTotal, {textAlign: 'right'}]}>
            Total
          </Text>
          <Text
            style={[
              styles.headerCell,
              styles.cellAction,
              {textAlign: 'center'},
            ]}>
            Actions
          </Text>
        </View>

        <FlatList
          data={tableData}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          renderItem={({item}) => (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, styles.cellTrans]}>
                {item.trans_no}
              </Text>
              <Text style={[styles.cell, styles.cellRef]} numberOfLines={1}>
                {item.reference}
              </Text>
              <Text style={[styles.cell, styles.cellDate]}>
                {formatDateDisplay(item.ord_date)}
              </Text>
              <Text
                style={[styles.cell, styles.cellTotal, {textAlign: 'right'}]}>
                {parseFloat(item.total).toLocaleString()}
              </Text>
              <View
                style={[
                  styles.cell,
                  styles.cellAction,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  },
                ]}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('VoidTransactionDetail', {
                      trans_no: item.trans_no,
                      type: selectedVoucher?.id,
                      title: selectedVoucher?.title,
                    })
                  }
                  style={{padding: 4}}>
                  <Icon name="eye-outline" size={20} color={APPCOLORS.Primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSharePDF(item)}
                  style={{padding: 4}}>
                  <Icon name="share-social-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyContainer}>
                <Text style={{color: '#666'}}>No data available</Text>
              </View>
            )
          }
        />
      </View>
    );
  };

  const renderSearchView = () => (
    <ScrollView
      contentContainerStyle={styles.searchContainer}
      showsVerticalScrollIndicator={false}>
      {/* Date Filters */}
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowFromPicker(true)}
          activeOpacity={0.7}>
          <Icon name="calendar-outline" size={18} color={APPCOLORS.Primary} />
          <Text style={styles.dateText}>
            {moment(fromDate).format('DD MMM YYYY')}
          </Text>
        </TouchableOpacity>

        <Icon name="arrow-forward" size={16} color="#999" />

        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowToPicker(true)}
          activeOpacity={0.7}>
          <Icon name="calendar-outline" size={18} color={APPCOLORS.Primary} />
          <Text style={styles.dateText}>
            {moment(toDate).format('DD MMM YYYY')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => handleSearch()}
          activeOpacity={0.8}>
          <Icon name="search-outline" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClearFilters}
          activeOpacity={0.8}>
          <Icon name="close-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Date Picker Components */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) {setFromDate(selectedDate);}
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
            if (selectedDate) {setToDate(selectedDate);}
          }}
        />
      )}

      {/* Search inputs */}
      <View style={styles.filterSection}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Icon
              name="search-outline"
              size={18}
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
          </View>

          <View style={styles.inputWrapper}>
            <Icon
              name="barcode-outline"
              size={18}
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
          </View>
        </View>
      </View>

      {renderTable()}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.headerTop,
          {
            height:
              Platform.OS === 'ios'
                ? responsiveHeight(8) + insets.top
                : responsiveHeight(8) + insets.top,
            paddingTop: insets.top,
            width: width,
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            if (selectedVoucher) {
              resetSearchState();
              setSelectedVoucher(null);
            } else {
              navigation.goBack();
            }
          }}
          style={{padding: 5}}>
          <Icon name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {selectedVoucher ? selectedVoucher.title : 'Void Transactions'}
        </Text>

        <View style={{width: 36}} />
      </View>

      {selectedVoucher ? renderSearchView() : renderGrid()}

      {isSharing && (
        <View style={StyleSheet.absoluteFillObject}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={{marginTop: 10, color: '#FFF', fontWeight: 'bold'}}>
              Generating PDF & Sharing...
            </Text>
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
  headerTop: {
    backgroundColor: '#0784B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
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
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  dateBox: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    height: 46,
    paddingHorizontal: 10,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  searchBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: APPCOLORS.Primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  tableWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(7, 132, 181, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0784B5',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
    alignItems: 'center',
  },
  cell: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  cellTrans: {flex: 1.2},
  cellRef: {flex: 1.8},
  cellDate: {flex: 1.5, textAlign: 'center'},
  cellTotal: {flex: 1.5, textAlign: 'right'},
  cellAction: {flex: 1.3},
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

export default VoidTransactions;
