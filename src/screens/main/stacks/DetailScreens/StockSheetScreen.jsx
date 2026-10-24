import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import BASEURL, {getActiveCompany} from '../../../../utils/BaseUrl';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import Header from '../../../../components/Header';

export default function StockSheetScreen({ navigation, route }) {
  const { category_id = '', item = {} } = route.params || {};

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState(category_id || null);
  const [categories, setCategories] = useState([]);

  // New states for combo1 and combo2
  const [combo1, setCombo1] = useState(null);
  const [combo1Data, setCombo1Data] = useState([]);
  const [combo2, setCombo2] = useState(null);
  const [combo2Data, setCombo2Data] = useState([]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all dropdowns
  useEffect(() => {
    fetchDropdownData(
      `${BASEURL}locations.php`,
      setLocations,
      'loc_code',
      'location_name',
    );
    fetchDropdownData(
      `${BASEURL}stock_category.php`,
      setCategories,
      'category_id',
      'description',
    );
    fetchCombo1Data();
    fetchCombo2Data();
  }, []);

  useEffect(() => {
    if (category_id) {
      setCategory(category_id);
      const timer = setTimeout(() => {
        fetchStockData({ category: category_id });
      }, 500);

      return () => clearTimeout(timer);
    } else {
      fetchStockData({});
    }
  }, [category_id]);

  // Fetch Combo1 Data
  const fetchCombo1Data = async () => {
    try {
      const formData = new FormData();
      formData.append('company', getActiveCompany());
      const { data: resData } = await axios.post(`${BASEURL}combo1.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (resData?.status === 'true') {
        const mapped = resData.data.map(i => ({
          label: i.description,
          value: i.combo_code,
        }));
        setCombo1Data(mapped);
      }
    } catch (e) {
      console.log('Combo1 Fetch Error:', e);
    }
  };

  // Fetch Combo2 Data
  const fetchCombo2Data = async () => {
    try {
      const formData = new FormData();
      formData.append('company', getActiveCompany());
      const { data: resData } = await axios.post(`${BASEURL}combo2.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (resData?.status === 'true') {
        const mapped = resData.data.map(i => ({
          label: i.description,
          value: i.combo_code,
        }));
        setCombo2Data(mapped);
      }
    } catch (e) {
      console.log('Combo2 Fetch Error:', e);
    }
  };

  const fetchDropdownData = async (url, setState, valueField, labelField) => {
    try {
      const formData = new FormData();
      formData.append('company', getActiveCompany());
      const { data: resData } = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (resData?.status === 'true') {
        const mapped = resData.data.map(i => ({
          label: i[labelField],
          value: i[valueField],
        }));
        setState(mapped);
      }
    } catch (e) {
      console.log('Dropdown Fetch Error:', e);
    }
  };

  const fetchStockData = async (filters = {}) => {
    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('description', filters.search || '');
      payload.append('loc_code', filters.location || '');
      payload.append('category_id', filters.category || '');
      payload.append('sub_cat1', filters.combo1 || '');
      payload.append('sub_cat2', filters.combo2 || '');
      payload.append('company', getActiveCompany());

      const res = await axios.post(`${BASEURL}stock_check_sheet.php`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.status === 'true' && Array.isArray(res.data.data)) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Fetch Stock Error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchStockData({
      search,
      location,
      category,
      combo1,
      combo2,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setLocation(null);
    setCategory(category_id || null);
    setCombo1(null);
    setCombo2(null);
    setData([]);
    fetchStockData({
      category: category_id || '',
      combo1: '',
      combo2: '',
    });
  };

  const formatQuantity = qty => {
    if (qty === null || qty === undefined || qty === '') {return '0.00';}
    const clean = typeof qty === 'string' ? qty.replace(/,/g, '').trim() : qty;
    const num = parseFloat(clean);
    if (isNaN(num)) {return '0.00';}
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderCard = ({ item: stockItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {stockItem.description || 'Stock Item'}
        </Text>
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyLabel}>QTY</Text>
          <Text style={styles.qtyValue}>
            {formatQuantity(stockItem.qoh)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardDetailsRow}>
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>STOCK ID</Text>
          <Text style={styles.metaValue}>{stockItem.stock_id || '-'}</Text>
        </View>

        <View style={[styles.metaBox, { alignItems: 'flex-end' }]}>
          <Text style={styles.metaLabel}>PART CODE</Text>
          <Text style={styles.metaValue}>{stockItem.text1 || '-'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`Stock Sheet ${category_id ? '(Filtered)' : ''}`}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={clearFilters}
            style={styles.headerResetBtn}
            activeOpacity={0.7}>
            <MaterialIcons name="refresh" size={18} color={APPCOLORS.WHITE} />
            <Text style={styles.headerResetText} numberOfLines={1}>
              Reset
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Card */}
      <View style={styles.filterCard}>
        {/* Row 1: Search + Location */}
        <View style={styles.filterRow}>
          <View style={[styles.searchBox, { flex: 1.1 }]}>
            <MaterialIcons
              name="search"
              size={18}
              color="#64748B"
              style={{ marginRight: 6 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Name"
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <Dropdown
            style={[styles.dropdown, { flex: 0.9 }]}
            data={locations}
            search
            searchPlaceholder="Search location..."
            labelField="label"
            valueField="value"
            placeholder="Location"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.dropdownSearchInput}
            value={location}
            onChange={i => setLocation(i.value)}
          />
        </View>

        {/* Row 2: Category + Sub Category 1 */}
        <View style={[styles.filterRow, { marginTop: 8 }]}>
          <Dropdown
            style={[styles.dropdown, { flex: 1 }]}
            data={categories}
            search
            searchPlaceholder="Search category..."
            labelField="label"
            valueField="value"
            placeholder="Category"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.dropdownSearchInput}
            value={category}
            onChange={i => setCategory(i.value)}
          />

          <Dropdown
            style={[styles.dropdown, { flex: 1 }]}
            data={combo1Data}
            search
            searchPlaceholder="Search sub category 1..."
            labelField="label"
            valueField="value"
            placeholder="Sub Category 1"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.dropdownSearchInput}
            value={combo1}
            onChange={i => setCombo1(i.value)}
          />
        </View>

        {/* Row 3: Sub Category 2 + Apply / Clear */}
        <View style={[styles.filterRow, { marginTop: 8 }]}>
          <Dropdown
            style={[styles.dropdown, { flex: 1.2 }]}
            data={combo2Data}
            search
            searchPlaceholder="Search sub category 2..."
            labelField="label"
            valueField="value"
            placeholder="Sub Category 2"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.dropdownSearchInput}
            value={combo2}
            onChange={i => setCombo2(i.value)}
          />

          <TouchableOpacity
            onPress={applyFilters}
            style={styles.applyBtn}
            activeOpacity={0.8}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={APPCOLORS.WHITE} />
            ) : (
              <>
                <MaterialIcons
                  name="tune"
                  size={16}
                  color={APPCOLORS.WHITE}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.applyBtnText}>Apply</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Header / Count */}
      <View style={styles.resultHeaderRow}>
        <Text style={styles.resultCountText}>
          {loading ? 'Searching stocks...' : `Showing ${data.length} records`}
        </Text>
      </View>

      {/* Data List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={APPCOLORS.Primary} />
          <Text style={styles.loadingText}>Loading stock items...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.stock_id || index}-${index}`}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory-2" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search criteria or filters.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexShrink: 0,
  },
  headerResetText: {
    color: APPCOLORS.WHITE,
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
    marginLeft: 3,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(1.2),
    padding: responsiveWidth(3.5),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 42,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    color: '#1E293B',
    fontSize: responsiveFontSize(1.6),
    paddingVertical: 0,
  },
  dropdown: {
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.5),
    color: '#94A3B8',
  },
  selectedTextStyle: {
    fontSize: responsiveFontSize(1.5),
    color: '#1E293B',
    fontWeight: '500',
  },
  dropdownSearchInput: {
    height: 38,
    fontSize: responsiveFontSize(1.5),
    borderRadius: 6,
  },
  applyBtn: {
    flex: 0.8,
    backgroundColor: APPCOLORS.Primary,
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: APPCOLORS.Primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  applyBtnText: {
    color: APPCOLORS.WHITE,
    fontWeight: '700',
    fontSize: responsiveFontSize(1.6),
  },
  resultHeaderRow: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(0.5),
  },
  resultCountText: {
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: responsiveWidth(3),
    paddingBottom: responsiveHeight(6),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: responsiveWidth(3.8),
    marginTop: responsiveHeight(1),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: APPCOLORS.Primary,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    color: '#1E293B',
    fontWeight: '700',
    fontSize: responsiveFontSize(1.7),
    lineHeight: 22,
  },
  qtyBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  qtyLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  qtyValue: {
    color: APPCOLORS.Primary,
    fontWeight: '400',
    fontSize: responsiveFontSize(1.65),
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaBox: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
    color: '#334155',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: responsiveHeight(8),
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: responsiveFontSize(1.6),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(8),
  },
  emptyTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

