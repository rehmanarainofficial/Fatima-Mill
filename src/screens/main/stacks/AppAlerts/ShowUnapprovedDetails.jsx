import { View, Text, FlatList, TextInput, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import AppText from '../../../../components/AppText';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../../utils/Responsive';

const ShowUnapprovedDetails = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
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
      {/* Custom Header */}
      <LinearGradient
        colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
        style={[styles.header, {
          height: responsiveHeight(Platform.OS === 'ios' ? 8 : 10) + (Platform.OS === 'ios' ? insets.top : 0),
          paddingTop: Platform.OS === 'ios' ? insets.top + responsiveHeight(-2) : 0,
        }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons
            name="arrow-back"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Alerts Details</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ padding: 5 }}>
          <Ionicons
            name="person"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>
      </LinearGradient>

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

const styles = {
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
};

export default ShowUnapprovedDetails;
