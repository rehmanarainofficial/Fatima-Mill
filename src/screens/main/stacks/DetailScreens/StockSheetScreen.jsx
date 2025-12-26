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
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import BASEURL from '../../../../utils/BaseUrl';
import { APPCOLORS } from '../../../../utils/APPCOLORS';

export default function StockSheetScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { category_id = '', item = {} } = route.params || {};

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState(category_id || null);
  const [categories, setCategories] = useState([]);

  // 🔹 New states for combo1 and combo2
  const [combo1, setCombo1] = useState(null);
  const [combo1Data, setCombo1Data] = useState([]);
  const [combo2, setCombo2] = useState(null);
  const [combo2Data, setCombo2Data] = useState([]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all dropdowns
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

  // 🔹 Fetch Combo1 Data
  const fetchCombo1Data = async () => {
    try {
      const { data } = await axios.get(`${BASEURL}combo1.php`);
      if (data?.status === 'true') {
        const mapped = data.data.map(i => ({
          label: i.description,
          value: i.combo_code,
        }));
        setCombo1Data(mapped);
      }
    } catch (e) {
      console.log('Combo1 Fetch Error:', e);
    }
  };

  // 🔹 Fetch Combo2 Data
  const fetchCombo2Data = async () => {
    try {
      const { data } = await axios.get(`${BASEURL}combo2.php`);
      if (data?.status === 'true') {
        const mapped = data.data.map(i => ({
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
      const { data } = await axios.get(url);
      if (data?.status === 'true') {
        const mapped = data.data.map(i => ({
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
      // 🔹 Add combo1 and combo2 to payload
      payload.append('sub_cat1', filters.combo1 || '');
      payload.append('sub_cat2', filters.combo2 || '');

      const res = await axios.post(`${BASEURL}stock_check_sheet.php`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.status === 'true' && Array.isArray(res.data.data)) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('❌ Fetch Stock Error:', err);
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
      combo1, // 🔹 Include combo1 in filters
      combo2, // 🔹 Include combo2 in filters
    });
  };

  const clearFilters = () => {
    setSearch('');
    setLocation(null);
    setCategory(category_id || null);
    setCombo1(null); // 🔹 Clear combo1
    setCombo2(null); // 🔹 Clear combo2
    setData([]);
    fetchStockData({
      category: category_id || '',
      combo1: '', // 🔹 Send empty for combo1
      combo2: '', // 🔹 Send empty for combo2
    });
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.description}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardKey}>Stock ID:</Text>
        <Text style={styles.cardValue}>{item.stock_id}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardKey}>Part Code:</Text>
        <Text style={styles.cardValue}>{item.text1 || '-'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardKey}>Qty:</Text>
        <Text style={styles.cardValue}>{item.qoh}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[APPCOLORS.Primary, APPCOLORS.Secondary, APPCOLORS.DARKLIGHTBLUE]}
      style={{ flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, {
        height: responsiveHeight(Platform.OS === 'ios' ? 8 : 10) + (Platform.OS === 'ios' ? insets.top : 0),
        paddingTop: Platform.OS === 'ios' ? insets.top : 10,
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back"
            color={APPCOLORS.WHITE}
            size={responsiveFontSize(4)}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Stock Sheet {category_id ? '(Filtered)' : ''}
        </Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text
            style={{
              color: APPCOLORS.WHITE,
              fontSize: responsiveFontSize(1.6),
            }}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={{ padding: responsiveWidth(2) }}>
        {/* First Row: Search + Location */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.glassInput, { flex: 1 }]}>
            <TextInput
              style={styles.textInput}
              placeholder="Search by Name"
              placeholderTextColor={'rgba(255,255,255,0.6)'}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Dropdown
            style={[styles.dropdown, { flex: 1 }]}
            data={locations}
            search
            labelField="label"
            valueField="value"
            placeholder="Select Location"
            placeholderStyle={{ color: 'rgba(255,255,255,0.6)' }}
            selectedTextStyle={{ color: APPCOLORS.WHITE }}
            itemTextStyle={{ color: APPCOLORS.BLACK }}
            value={location}
            onChange={item => setLocation(item.value)}
          />
        </View>

        {/* Second Row: Category + Combo1 */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Dropdown
            style={[styles.dropdown, { flex: 1 }]}
            data={categories}
            search
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            placeholderStyle={{ color: 'rgba(255,255,255,0.6)' }}
            selectedTextStyle={{ color: APPCOLORS.WHITE }}
            itemTextStyle={{ color: APPCOLORS.BLACK }}
            value={category}
            onChange={item => setCategory(item.value)}
          />
          <Dropdown
            style={[styles.dropdown, { flex: 1 }]}
            data={combo1Data}
            search
            labelField="label"
            valueField="value"
            placeholder="Sub Category1"
            placeholderStyle={{ color: 'rgba(255,255,255,0.6)' }}
            selectedTextStyle={{ color: APPCOLORS.WHITE }}
            itemTextStyle={{ color: APPCOLORS.BLACK }}
            value={combo1}
            onChange={item => setCombo1(item.value)}
          />
        </View>

        {/* Third Row: Combo2 + Apply Button */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Dropdown
            style={[styles.dropdown, { flex: 1 }]}
            data={combo2Data}
            search
            labelField="label"
            valueField="value"
            placeholder="Sub Category2"
            placeholderStyle={{ color: 'rgba(255,255,255,0.6)' }}
            selectedTextStyle={{ color: APPCOLORS.WHITE }}
            itemTextStyle={{ color: APPCOLORS.BLACK }}
            value={combo2}
            onChange={item => setCombo2(item.value)}
          />
          <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
            <Text style={{ color: APPCOLORS.WHITE, fontWeight: '700' }}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={APPCOLORS.WHITE}
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingHorizontal: responsiveWidth(2), paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text
              style={{
                color: APPCOLORS.WHITE,
                textAlign: 'center',
                marginTop: 30,
              }}>
              No records found
            </Text>
          )}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: APPCOLORS.WHITE,
    fontSize: responsiveFontSize(2.2),
    fontWeight: '700',
  },
  glassInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: responsiveWidth(3),
    height: responsiveHeight(6),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textInput: {
    color: APPCOLORS.WHITE,
    fontSize: responsiveFontSize(1.8),
  },
  dropdown: {
    height: responsiveHeight(6),
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(2),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  applyButton: {
    backgroundColor: APPCOLORS.DARKLIGHTBLUE,
    borderRadius: 10,
    height: responsiveHeight(6),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: responsiveWidth(4),
    marginTop: responsiveHeight(2),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    color: APPCOLORS.WHITE,
    fontWeight: '700',
    fontSize: responsiveFontSize(1.8),
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardKey: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    fontSize: responsiveFontSize(1.6),
  },
  cardValue: {
    color: APPCOLORS.WHITE,
    textAlign: 'right',
    flexShrink: 1,
    fontSize: responsiveFontSize(1.6),
  },
});
