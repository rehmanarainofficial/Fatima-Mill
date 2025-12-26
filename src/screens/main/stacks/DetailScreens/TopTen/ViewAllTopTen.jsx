import { View, Text, TouchableOpacity, FlatList, TextInput, Platform, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NameBalanceContainer from '../../../../../components/NameBalanceContainer'
import AppText from '../../../../../components/AppText'
import { APPCOLORS } from '../../../../../utils/APPCOLORS';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../../../utils/Responsive';

const ViewAllTopTen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { name, data } = route.params;

  const [filteredData, setFilteredData] = useState(data);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    handleSearch(searchText);
  }, [data]);

  const handleSearch = text => {
    setSearchText(text);
    if (text === '') {
      setFilteredData(data);
    } else {
      const lowerText = text.toLowerCase();
      const filtered = data.filter(item => {
        if (name === 'Suppliers') {
          return item?.supp_name?.toLowerCase().includes(lowerText);
        } else if (name === 'Banks') {
          return item?.bank_name?.toLowerCase().includes(lowerText);
        } else if (name === 'Items') {
          return item?.description?.toLowerCase().includes(lowerText);
        } else if (name === 'Salesmen') {
          return item?.salesman_name?.toLowerCase().includes(lowerText);
        } else if (name === 'Customers') {
          return item?.name?.toLowerCase().includes(lowerText);
        }
        return false;
      });
      setFilteredData(filtered);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Custom Header */}
      <LinearGradient
        colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
        style={[styles.header, {
          height: responsiveHeight(Platform.OS === 'ios' ? 12 : 10) + (Platform.OS === 'ios' ? insets.top : 0),
          paddingTop: Platform.OS === 'ios' ? insets.top + responsiveHeight(1) : 10,
        }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons
            name="arrow-back"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{`All ${name}`}</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={{ padding: 5 }}>
          <Ionicons
            name="person"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ marginTop: 20, padding: 20 }}>
        <AppText title={`All ${name}`} titleSize={2} titleWeight />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 12,
            width: responsiveWidth(96),
            alignSelf: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 2,
            marginVertical: 10,
            paddingHorizontal: 10,
          }}>
          <Ionicons name="search" size={22} color="#888" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search..."
            value={searchText}
            onChangeText={handleSearch}
            style={{
              flex: 1,
              height: responsiveHeight(6.5),
              fontSize: 16,
              color: '#333',
            }}
            placeholderTextColor="#888"
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: responsiveWidth(2),
        }}
        renderItem={({ item }) => (
          <NameBalanceContainer
            Name={
              name === 'Suppliers'
                ? item.supp_name
                : name === 'Banks'
                  ? item?.bank_name
                  : name === 'Items'
                    ? item?.description
                    : name === 'Salesmen'
                      ? item?.salesman_name
                      : name === 'Customers'
                        ? item?.name
                        : ''
            }
            balance={
              name === 'Banks'
                ? item?.bank_balance
                : name === 'Items'
                  ? item?.total
                  : item?.Balance
            }
            type={name === 'Items' ? 'Inventory Valuation' : name}
            item={item}
            fromViewAll={true}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#666', fontSize: 16 }}>No items found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    color: APPCOLORS.WHITE,
    fontSize: responsiveFontSize(3),
    fontWeight: 'bold',
  },
});

export default ViewAllTopTen;
