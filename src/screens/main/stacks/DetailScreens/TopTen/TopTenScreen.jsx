import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import SimpleHeader from '../../../../../components/SimpleHeader';
import {
  GetBankBalance,
  GetItemBalance,
  GetPayable,
  GetReceivable,
  GetSalesman,
} from '../../../../../global/ChartApisCall';
import AppText from '../../../../../components/AppText';
import NameBalanceContainer from '../../../../../components/NameBalanceContainer';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from '../../../../../utils/Responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Assuming this import path
import { APPCOLORS } from '../../../../../utils/APPCOLORS'; // Assuming this import path

const TopTenScreen = ({ route, navigation }) => {
  const { name } = route.params;
  console.log(name);

  const [top, setTop] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loader, setLoader] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setLoader(true);
      if (name == 'Customer') {
        const response = await GetReceivable();
        setTop(response.data_cust_bal);
        setAllData(response.data_view_cust_bal);
      } else if (name == 'Suppliers') {
        const response = await GetPayable();
        setTop(response.data_supp_bal);
        setAllData(response.data_supp_bal_view_all);
      } else if (name == 'Banks') {
        const response = await GetBankBalance();
        setTop(response.data_bank_bal);
        setAllData(response.data_bank_bal_view_all);
      } else if (name == 'Items') {
        const response = await GetItemBalance();
        setTop(response.data_item_bal);
        setAllData(response.data_item_bal_view_all);
      } else if (name == 'Salesman') {
        const response = await GetSalesman();
        setTop(response.data_salesman_bal);
        setAllData(response.data_salesman_bal_view_all);
      }
      setLoader(false);
    });

    return unsubscribe;
  }, [navigation]);

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

        <Text style={styles.headerTitle}>{`Top 10 ${name}`}</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={{ padding: 5 }}>
          <Ionicons
            name="person"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Header Row with View All */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <AppText title={`Top 10 ${name}`} titleSize={2} titleWeight />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ViewAllTopTen', {
                name: name,
                allData: allData,
              })
            }>
            <AppText title={`View All`} titleSize={2} titleWeight />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput
          placeholder={`Search ${name}`}
          onChangeText={text => {
            if (text === '') {
              setTop(allData.slice(0, 10));
            } else {
              const query = text.toLowerCase();
              const filtered = allData.filter(item => {
                if (name === 'Suppliers') {
                  return item?.supp_name?.toLowerCase().includes(query);
                } else if (name === 'Banks') {
                  return item?.bank_name?.toLowerCase().includes(query);
                } else if (name === 'Items') {
                  return item?.description?.toLowerCase().includes(query);
                } else {
                  return item?.name?.toLowerCase().includes(query);
                }
              });
              setTop(filtered.slice(0, 10));
            }
          }}
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

        {/* Column Headings */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: '#000',
              minWidth: responsiveWidth(100),
            }}>
            <View style={{ width: responsiveWidth(35) }}>
              <AppText title="Name" titleSize={2} titleWeight />
            </View>
            <View style={{ width: responsiveWidth(22) }}>
              <AppText title="Balance" titleSize={2} titleWeight />
            </View>
            <View style={{ width: responsiveWidth(13) }}>
              <AppText title="%" titleSize={2} titleWeight />
            </View>
            <View style={{ width: responsiveWidth(30) }}>
              <AppText title="Action" titleSize={2} titleWeight />
            </View>
          </View>
        </ScrollView>

        {/* Loader or List */}
        {loader ? (
          <ActivityIndicator size={'large'} style={{ alignSelf: 'center' }} />
        ) : top?.length > 0 ? (
          <FlatList
            data={top}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <NameBalanceContainer
                Name={
                  name == 'Suppliers'
                    ? item?.supp_name
                    : name == 'Items'
                      ? item.description
                      : name == 'Banks'
                        ? item?.bank_name
                        : item?.name
                }
                balance={
                  name == 'Items'
                    ? item.total
                    : name == 'Banks'
                      ? item?.bank_balance
                      : item?.Balance
                }
                type={name}
                item={item}
              />
            )}
          />
        ) : (
          <View
            style={{
              height: responsiveHeight(60),
              width: responsiveWidth(100),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppText title={`No Top ${name} found`} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TopTenScreen;