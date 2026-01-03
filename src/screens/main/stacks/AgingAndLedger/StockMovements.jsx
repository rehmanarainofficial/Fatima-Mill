import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import { APPCOLORS } from '../../../../utils/APPCOLORS';
import BASEURL from '../../../../utils/BaseUrl';

const StockMovements = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const {
    item,
    fromAllMovements = false,
    fromViewAll = false,
  } = route.params || {};

  const shouldShowStockDropdown = fromAllMovements || fromViewAll;
  const [locations, setLocations] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStock, setSelectedStock] = useState(item?.stock_id || '');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [fromDate, setFromDate] = useState(
    moment().subtract(1, 'month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [movementData, setMovementData] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  // ------------------------------
  // FETCH LOCATIONS (GET)
  // ------------------------------
  const fetchLocations = async () => {
    try {
      const res = await fetch(`${BASEURL}locations.php`);
      const json = await res.json();

      if (json.status === 'true') {
        setLocations(json.data);
      }
    } catch (e) {
      console.log('Location error:', e);
    }
  };

  // ------------------------------
  // FETCH STOCKS (GET)
  // ------------------------------
  const fetchStocks = async () => {
    try {
      const res = await fetch(`${BASEURL}stock_master.php`);
      const json = await res.json();

      if (json.status === 'true') {
        setStocks(json.data);
        setFilteredStocks(json.data); // Initialize filtered stocks
      }
    } catch (e) {
      console.log('Stock master error:', e);
    }
  };

  // ------------------------------
  // SEARCH STOCKS
  // ------------------------------
  const searchStocks = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter(
        stock =>
          stock.description?.toLowerCase().includes(query.toLowerCase()) ||
          stock.stock_id?.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredStocks(filtered);
    }
  };

  // ------------------------------
  // FETCH STOCK MOVEMENT (POST)
  // ------------------------------
  const fetchStockMovement = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('category_id', item?.category_id);
      formData.append('from_date', fromDate);
      formData.append('to_date', toDate);
      formData.append('StockLocation', selectedLocation);

      const res = await fetch(`${BASEURL}stock_movements.php`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      console.log('json', json);

      if (json.status === 'true') {
        setMovementData(json.data || []);

        // Set opening balance from API response
        const opening = json.opening !== null ? parseFloat(json.opening) : 0;
        setOpeningBalance(opening);

        // Calculate closing balance using API's balance field from last transaction
        let closing = opening;
        if (json.data && json.data.length > 0) {
          // Use the balance from the last transaction in API response
          const lastTransaction = json.data[json.data.length - 1];
          closing = parseFloat(lastTransaction.balance) || opening;
        }
        setClosingBalance(closing);
      } else {
        setMovementData([]);
        setOpeningBalance(0);
        setClosingBalance(0);
      }
    } catch (e) {
      console.log('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchStocks();
    if (item?.stock_id) {
      fetchStockMovement();
    }
  }, []);

  // ------------------------------
  // RESET FILTERS
  // ------------------------------
  const handleReset = () => {
    setSelectedLocation('');
    if (!item?.stock_id) {
      setSelectedStock('');
    }
    setFromDate(moment().subtract(1, 'month').format('YYYY-MM-DD'));
    setToDate(moment().format('YYYY-MM-DD'));
    setMovementData([]);
    setOpeningBalance(0);
    setClosingBalance(0);
    setSearchQuery('');
    setFilteredStocks(stocks);
  };

  // ------------------------------
  // FORMAT NUMBER WITH COMMAS
  // ------------------------------
  const formatNumber = num => {
    if (num === null || num === undefined) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';

    // Round to 2 decimal places and format with commas
    return Math.round(number).toLocaleString('en-US');
  };

  // ------------------------------
  // RENDER EACH TRANSACTION CARD
  // ------------------------------
  const renderCard = ({ item: transaction, index }) => {
    const qty = parseFloat(transaction.qty || 0);
    const isPositive = qty > 0;

    // Use the balance directly from API response instead of calculating
    const balance = parseFloat(transaction.balance) || 0;

    return (
      <View style={styles.card}>
        <Text style={styles.dateText}>
          {moment(transaction.tran_date).format('DD MMM YYYY')}
        </Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.refText}>{transaction.reference}</Text>
            <Text style={styles.nameText}>{transaction.name}</Text>
            <Text style={styles.locationText}>{transaction.location}</Text>
          </View>

          <View style={styles.amountSection}>
            <Text
              style={[styles.qtyText, { color: isPositive ? 'green' : 'red' }]}>
              {isPositive ? '+' : ''}
              {formatNumber(qty)}
            </Text>
            <Text style={styles.balanceText}>
              Balance: {formatNumber(balance)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>

      {/* ---------------- HEADER ---------------- */}
      <View style={[styles.header, {
        height: responsiveHeight(Platform.OS === 'ios' ? 12 : 10) + (Platform.OS === 'ios' ? insets.top : 0),
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={responsiveFontSize(3)}
            color="white"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Stock Movement</Text>

        {/* Reset Button in Header Right */}
        <TouchableOpacity onPress={handleReset}>
          <MaterialIcons
            name="refresh"
            size={responsiveFontSize(3)}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* ---------------- FILTER SECTION ---------------- */}
      <View style={styles.filterBox}>
        {/* ROW 1 - STOCK DROPDOWN (Only show when fromAllMovements) */}
        {shouldShowStockDropdown && (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowStockModal(true)}>
              <Text
                style={
                  selectedStock ? styles.dropdownText : styles.placeholderText
                }>
                {selectedStock
                  ? stocks.find(x => x.stock_id === selectedStock)
                    ?.description || 'Select Stock'
                  : 'Select Stock'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* ROW 2 - LOCATION DROPDOWN */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowLocationModal(true)}>
            <Text
              style={
                selectedLocation ? styles.dropdownText : styles.placeholderText
              }>
              {selectedLocation
                ? locations.find(x => x.loc_code === selectedLocation)
                  ?.location_name
                : 'Select Location'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* ROW 3 - DATE PICKERS & APPLY BUTTON */}
        <View style={styles.filterRow}>
          {/* From Date */}
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateTextFilter}>{fromDate}</Text>
          </TouchableOpacity>

          {/* To Date */}
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateTextFilter}>{toDate}</Text>
          </TouchableOpacity>

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={fetchStockMovement}
            disabled={loading || (!selectedStock && fromAllMovements)}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="search" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* BALANCE ROW - Always show when we have data */}
        {(movementData.length > 0 ||
          openingBalance !== 0 ||
          closingBalance !== 0) && (
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Opening Balance</Text>
                <Text style={styles.balanceValue}>
                  {formatNumber(openingBalance)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Closing Balance</Text>
                <Text style={styles.balanceValue}>
                  {formatNumber(closingBalance)}
                </Text>
              </View>
            </View>
          )}

        {/* STOCK MODAL WITH SEARCH */}
        <Modal
          visible={showStockModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowStockModal(false);
            setSearchQuery('');
            setFilteredStocks(stocks);
          }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Stock</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowStockModal(false);
                    setSearchQuery('');
                    setFilteredStocks(stocks);
                  }}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by stock ID or description..."
                  value={searchQuery}
                  onChangeText={searchStocks}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => searchStocks('')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.resultCount}>
                {filteredStocks.length} of {stocks.length} stocks found
              </Text>

              <FlatList
                data={filteredStocks}
                keyExtractor={(item, index) => `${item.stock_id}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedStock === item.stock_id && styles.selectedItem,
                    ]}
                    onPress={() => {
                      setSelectedStock(item.stock_id);
                      setShowStockModal(false);
                      setSearchQuery('');
                      setFilteredStocks(stocks);
                    }}>
                    <View style={styles.stockItem}>
                      <Text style={styles.stockId}>{item.stock_id}</Text>
                      <Text style={styles.modalItemText}>
                        {item.description}
                      </Text>
                      {item.units && (
                        <Text style={styles.unitText}>Unit: {item.units}</Text>
                      )}
                    </View>
                    {selectedStock === item.stock_id && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={APPCOLORS.Primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                removeClippedSubviews={true}
              />
            </View>
          </View>
        </Modal>

        {/* LOCATION MODAL */}
        <Modal
          visible={showLocationModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLocationModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Location</Text>
                <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={locations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedLocation === item.loc_code && styles.selectedItem,
                    ]}
                    onPress={() => {
                      setSelectedLocation(item.loc_code);
                      setShowLocationModal(false);
                    }}>
                    <Text style={styles.modalItemText}>
                      {item.location_name}
                    </Text>
                    {selectedLocation === item.loc_code && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={APPCOLORS.Primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* FROM DATE PICKER */}
        {Platform.OS === 'ios' ? (
          <Modal
            visible={showFromPicker}
            transparent={true}
            animationType="slide">
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select From Date</Text>
                  <TouchableOpacity onPress={() => setShowFromPicker(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={new Date(fromDate)}
                  mode="date"
                  display="inline"
                  onChange={(e, d) => {
                    if (d) setFromDate(moment(d).format('YYYY-MM-DD'));
                  }}
                />
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setShowFromPicker(false)}>
                  <Text style={styles.closeModalBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          showFromPicker && (
            <DateTimePicker
              value={new Date(fromDate)}
              mode="date"
              onChange={(e, d) => {
                setShowFromPicker(false);
                if (d) setFromDate(moment(d).format('YYYY-MM-DD'));
              }}
            />
          )
        )}

        {/* TO DATE PICKER */}
        {Platform.OS === 'ios' ? (
          <Modal
            visible={showToPicker}
            transparent={true}
            animationType="slide">
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select To Date</Text>
                  <TouchableOpacity onPress={() => setShowToPicker(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={new Date(toDate)}
                  mode="date"
                  display="inline"
                  onChange={(e, d) => {
                    if (d) setToDate(moment(d).format('YYYY-MM-DD'));
                  }}
                />
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setShowToPicker(false)}>
                  <Text style={styles.closeModalBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          showToPicker && (
            <DateTimePicker
              value={new Date(toDate)}
              mode="date"
              onChange={(e, d) => {
                setShowToPicker(false);
                if (d) setToDate(moment(d).format('YYYY-MM-DD'));
              }}
            />
          )
        )}
      </View>

      {/* ---------------- TRANSACTIONS LIST ---------------- */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={APPCOLORS.Primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={movementData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCard}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingHorizontal: responsiveWidth(2),
          }}
          ListEmptyComponent={
            <View style={styles.noDataContainer}>
              <MaterialIcons name="inventory-2" size={60} color="#ccc" />
              <Text style={styles.noData}>
                {selectedStock || !fromAllMovements
                  ? 'No movement found for selected filters'
                  : 'Please select a stock to view movements'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default StockMovements;

const styles = StyleSheet.create({
  header: {
    backgroundColor: APPCOLORS.Primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
  },

  filterBox: {
    backgroundColor: '#fff',
    margin: responsiveWidth(3),
    padding: responsiveWidth(3.5),
    borderRadius: 14,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: responsiveHeight(1.5),
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: responsiveWidth(2),
  },

  dropdown: {
    flex: 1,
    backgroundColor: '#fff',
    padding: responsiveWidth(3),
    borderRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: responsiveFontSize(1.6),
    color: '#000',
  },
  placeholderText: {
    fontSize: responsiveFontSize(1.6),
    color: '#999',
  },

  dateBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: responsiveWidth(3),
    borderRadius: 10,
    elevation: 3,
  },
  dateTextFilter: {
    fontSize: responsiveFontSize(1.6),
    color: '#000',
  },

  applyBtn: {
    backgroundColor: APPCOLORS.Primary,
    padding: responsiveWidth(3),
    borderRadius: 10,
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: responsiveWidth(3),
    borderRadius: 10,
    marginTop: responsiveHeight(1),
    borderLeftWidth: 4,
    borderLeftColor: APPCOLORS.Primary,
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: responsiveFontSize(1.4),
    color: '#666',
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: responsiveFontSize(1.8),
    color: APPCOLORS.Primary,
    fontWeight: 'bold',
    marginTop: 4,
  },

  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(6),
  },
  noData: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
    fontSize: responsiveFontSize(1.8),
  },

  // ---------- CARD ----------
  card: {
    backgroundColor: '#fff',
    padding: responsiveWidth(4),
    borderRadius: 12,
    elevation: 3,
    marginBottom: responsiveHeight(1.5),
    borderLeftWidth: 4,
    borderLeftColor: APPCOLORS.Primary,
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(1.5),
    marginBottom: 8,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
    color: '#000',
  },
  nameText: {
    color: '#444',
    marginVertical: 3,
    fontSize: responsiveFontSize(1.6),
  },
  locationText: {
    fontSize: responsiveFontSize(1.5),
    color: '#777',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  qtyText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: responsiveFontSize(1.4),
    color: '#777',
  },

  // ---------- MODAL STYLES ----------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: responsiveWidth(95),
    maxHeight: responsiveHeight(80),
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveWidth(3),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f5f5f5',
    marginHorizontal: responsiveWidth(4),
    marginTop: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: responsiveFontSize(1.8),
    color: '#000',
  },
  resultCount: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: 8,
    fontSize: responsiveFontSize(1.4),
    color: '#666',
    backgroundColor: '#f9f9f9',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  modalItemText: {
    fontSize: responsiveFontSize(1.8),
    color: '#000',
    flex: 1,
  },
  stockItem: {
    flex: 1,
  },
  stockId: {
    fontSize: responsiveFontSize(1.4),
    color: '#666',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: responsiveFontSize(1.2),
    color: '#888',
    marginTop: 2,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: responsiveWidth(90),
    paddingBottom: 20,
    elevation: 5,
  },
  closeModalBtn: {
    backgroundColor: APPCOLORS.Primary,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(1.8),
  },
});
