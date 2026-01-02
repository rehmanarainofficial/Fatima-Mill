import { View, Text, TouchableOpacity, Platform, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AlertCards from '../../../../components/AlertCards'
import moment from 'moment'
import axios from 'axios'
import BaseUrl from '../../../../utils/BaseUrl'
import { APPCOLORS } from '../../../../utils/APPCOLORS'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../../utils/Responsive';

const AlertScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([])
  const [AllData, setAllData] = useState()

  const [loader, setLoader] = useState(false)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getMoneyData()
    })
    return unsubscribe
  }, [navigation])



  const getMoneyData = async () => {
    setLoader(true)


    const options = {
      method: 'GET',
      url: `${BaseUrl}dash_approval.php`,
      headers: {
      },
    };

    try {
      const { data } = await axios.request(options);
      // console.log(data);
      // setslider_data(data)
      setAllData(data)
      setLoader(false)
    } catch (error) {
      console.error(error);
      setLoader(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Custom Header */}
      <LinearGradient
        colors={[APPCOLORS.Primary, APPCOLORS.Secondary]}
        style={[styles.header, {
          height: responsiveHeight(Platform.OS === 'ios' ? 10 : 14) + (Platform.OS === 'ios' ? insets.top : 0),
          paddingTop: Platform.OS === 'ios' ? insets.top + responsiveHeight(1) : 14,
        }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons
            name="arrow-back"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Alerts</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={{ padding: 5 }}>
          <Ionicons
            name="person"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>
      </LinearGradient>
      <View style={{ gap: 30, marginTop: 20 }}>

        {
          loader && (
            <ActivityIndicator size={'large'} color={APPCOLORS.BLACK} />
          )
        }

        <AlertCards
          AlertHeading={"Sales Alert"}
          HeadingOne={"Quotation approval"}
          ValueOne={AllData?.approval_data?.quotation_approval}
          onValuePressOne={() => navigation.navigate("ShowUnapprovedDetails", { dataDetail: AllData?.data_unapprove_quote })}


          HeadingTwo={"So approval"}
          ValueTwo={AllData?.approval_data?.so_approval}


          HeadingThree={"Po approval"}
          ValueThree={AllData?.approval_data?.po_approval}
          onValuePressThree={() => navigation.navigate("ShowUnapprovedDetails", { dataDetail: AllData?.data_unapprove_po_order })}

        />
        <AlertCards data={AllData}
          AlertHeading={"Purchase Alert"}
          HeadingOne={"Grn approval"}
          ValueOne={AllData?.approval_data?.grn_approval}

          HeadingTwo={"Invoice approval"}
          ValueTwo={AllData?.approval_data?.po_invoice_approval}

          HeadingThree={"Voucher approval"}
          ValueThree={AllData?.approval_data?.voucher_approval}

        />
        <AlertCards data={AllData}
          AlertHeading={"Inventory Alert"}
          HeadingOne={"Delivery approval"}
          ValueOne={AllData?.approval_data?.delivery_approval}

          HeadingTwo={"Invoice approval"}
          ValueTwo={AllData?.approval_data?.invoice_approval}


        />
      </View>
    </View>
  )
}

export default AlertScreen