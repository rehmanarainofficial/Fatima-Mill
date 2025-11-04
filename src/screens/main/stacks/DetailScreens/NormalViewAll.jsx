import { View, Text, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import SimpleHeader from '../../../../components/SimpleHeader';
import NameBalanceContainer from '../../../../components/NameBalanceContainer';
import { responsiveHeight, responsiveWidth } from '../../../../utils/Responsive';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import AppButton from '../../../../components/AppButton';
import Ionicons from 'react-native-vector-icons/Ionicons'; // 👈 add this import

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

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SimpleHeader title="View All" />

      {/* Aging & Ledger Buttons */}
      {(dataname === 'Customer' || dataname === 'Supplier') && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 15,
            marginVertical: 15,
          }}>
          <AppButton
            title="Aging"
            onPress={() => navigation.navigate('PdfScreen')}
            btnWidth={40}
            bgColor={APPCOLORS.BLUE || '#007AFF'}
          />
          <AppButton
            title="Ledger"
            onPress={() => navigation.navigate('PdfScreen')}
            btnWidth={40}
            bgColor={'#4CAF50'}
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
          paddingBottom: 350,
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
            type={dataname}
            item={item}
          />
        )}
      />
    </View>
  );
};

export default NormalViewAll;
