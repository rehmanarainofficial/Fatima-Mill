import { View, Text, FlatList, TextInput, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import AppText from '../../../../components/AppText';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../../utils/Responsive';
import Header from '../../../../components/Header';

const ShowUnapprovedDetails = ({ navigation, route }) => {
  const { dataDetail } = route.params;

  const [filteredData, setFilteredData] = useState(dataDetail);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = text => {
    setSearchText(text);
    if (text === '') {
      setFilteredData(dataDetail);
    } else {
      const lowerText = text.toLowerCase();
      const filtered = dataDetail.filter(item =>
        item?.name?.toLowerCase().includes(lowerText) ||
        item?.reference?.toLowerCase().includes(lowerText) ||
        item?.ord_date?.toLowerCase().includes(lowerText)
      );
      setFilteredData(filtered);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header
        title="Alerts Details"
        onBack={() => navigation.goBack()}
        rightIcon="person"
        onRightPress={() => navigation.navigate('Dashboard')}
      />

      <View style={{ padding: 20 }}>
        {/* 🔍 Search Bar */}
        <TextInput
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search by name, reference or date"
          style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderColor: '#ccc',
            borderWidth: 1,
            marginBottom: 15,
          }}
        />

        {/* 📋 List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            return (
              <View
                style={{
                  padding: 20,
                  backgroundColor: APPCOLORS.Secondary,
                  borderRadius: 10,
                }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText title={'Reference'} titleSize={2} />
                  <AppText title={item.reference} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText title={'Name'} titleSize={2} />
                  <AppText title={item.name} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText title={'Order date'} titleSize={2} />
                  <AppText title={item.ord_date} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText title={'Total'} titleSize={2} />
                  <AppText title={(item.total).toLocaleString('en-PK')} />
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

export default ShowUnapprovedDetails;
