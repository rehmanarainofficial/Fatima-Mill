import { View, Text, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import SimpleHeader from '../../../../components/SimpleHeader';
import NameBalanceContainer from '../../../../components/NameBalanceContainer';
import { responsiveHeight, responsiveWidth } from '../../../../utils/Responsive';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import AppButton from '../../../../components/AppButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NormalViewAll = ({ navigation, route }) => {
  const { AllData, dataname } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(AllData);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(AllData);
    } else {
      const lowerSearch = searchQuery.toLowerCase();
      const newData = AllData.filter(item => {
        const name =
          dataname === 'Supplier'
            ? item.supp_name
            : dataname === 'Bank'
            ? item?.bank_name
            : dataname === 'item'
            ? item?.description
            : dataname === 'salesman'
            ? item?.salesman_name
            : dataname === 'Customer'
            ? item?.name
            : dataname === 'Payable'
            ? item.supp_name
            : item?.name;

        return name?.toLowerCase().includes(lowerSearch);
      });
      setFilteredData(newData);
    }
  }, [searchQuery, AllData]);

  // Handle navigation based on dataname
  const handleAgingPress = () => {
    if (dataname === 'Customer' || dataname === 'Supplier') {
      navigation.navigate('PdfScreen');
    }
  };

  const handleLedgerPress = () => {
    if (dataname === 'Customer' || dataname === 'Supplier') {
      navigation.navigate('PdfScreen');
    } else if (dataname === 'item') {
      // For Inventory items, navigate to All Stock Movements
      navigation.navigate('StockMovements', {
        fromAllMovements: true
      });
    }
  };

  const getButtonTitle = () => {
    if (dataname === 'item') return 'All Movements';
    return 'Ledger';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SimpleHeader title="View All" />

      {/* Action Buttons */}
      {(dataname === 'Customer' || dataname === 'Supplier' || dataname === 'item') && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 15,
            marginVertical: 15,
          }}>
          
          {/* Aging Button - Only for Customer/Supplier */}
          {(dataname === 'Customer' || dataname === 'Supplier') && (
            <AppButton
              title="Aging"
              onPress={handleAgingPress}
              btnWidth={40}
              bgColor={APPCOLORS.BLUE || '#007AFF'}
            />
          )}
          
          {/* Ledger/All Movements Button */}
          <AppButton
            title={getButtonTitle()}
            onPress={handleLedgerPress}
            btnWidth={dataname === 'item' ? 50 : 40}
            bgColor={dataname === 'item' ? APPCOLORS.Primary : '#4CAF50'}
          />
        </View>
      )}

      {/* 🔍 Search Bar with Icon */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 12,
          width: responsiveWidth(90),
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
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            flex: 1,
            height: responsiveHeight(6.5),
            fontSize: 16,
            color: '#333',
          }}
          placeholderTextColor="#888"
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 15,
          paddingTop: 10,
        }}
        renderItem={({ item }) => (
          <NameBalanceContainer
            Name={
              dataname === 'Supplier'
                ? item.supp_name
                : dataname === 'Bank'
                ? item?.bank_name
                : dataname === 'item'
                ? item?.description
                : dataname === 'salesman'
                ? item?.salesman_name
                : dataname === 'Customer'
                ? item?.name
                : dataname === 'Payable'
                ? item.supp_name
                : item?.name
            }
            balance={
              dataname === 'Bank'
                ? item?.bank_balance
                : dataname === 'item'
                ? item?.total
                : item?.Balance
            }
            type={dataname === 'item' ? 'Inventory Valuation' : dataname}
            item={item}
            fromViewAll={true} // This tells StockMovements to show stock dropdown
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#666', fontSize: 16 }}>
              No items found
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default NormalViewAll;