import {View, Text, FlatList, StyleSheet, TextInput} from 'react-native';
import React, {useState} from 'react';
import SimpleHeader from '../../../../components/SimpleHeader';
import DropButtons from '../../../../components/DropButtons';
import DatePicker from 'react-native-date-picker';
import LinearGradient from 'react-native-linear-gradient';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import AppText from '../../../../components/AppText';
import {responsiveHeight, responsiveWidth} from '../../../../utils/Responsive';

const ViewAll = ({navigation, route}) => {
  const [fromDate, setFromDate] = useState(new Date());
  const [openFrom, setOpenFrom] = useState(false);

  return (
    <View>
      <SimpleHeader title="Detailed" />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: 20,
          marginVertical: 20,
        }}>
        <DropButtons title="From Date" onPress={() => setOpenFrom(true)} />
        <DropButtons title="To Date" onPress={() => setOpenFrom(true)} />
      </View>
      <DatePicker
        modal
        open={openFrom}
        date={fromDate}
        mode="date"
        onConfirm={date => {
          setOpenFrom(false);
          setFromDate(date);
        }}
        onCancel={() => {
          setOpenFrom(false);
        }}
      />

      <FlatList
        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        contentContainerStyle={{paddingBottom: 200}}
        renderItem={() => {
          return (
            <LinearGradient
              colors={['#E6E6E6', '#ACD7E5']}
              style={{
                padding: 20,
                borderRadius: 20,
                gap: 10,
                marginTop: 20,
                width: responsiveWidth(90),
                alignSelf: 'center',
              }}>
              <View style={styles.container}>
                <AppText
                  title="Client: "
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                  titleWeight
                />
                <AppText
                  title="Lorem ispum"
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                  titleWeight
                />
              </View>

              <View style={styles.container}>
                <AppText
                  title="Order: "
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                  titleWeight
                />
                <AppText
                  title="#721"
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                />
              </View>

              <View style={styles.container}>
                <AppText
                  title="Ref: "
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                  titleWeight
                />
                <AppText
                  title="S003213"
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                />
              </View>

              <View style={styles.container}>
                <AppText
                  title="Branch: "
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                  titleWeight
                />
                <AppText
                  title="Lorem ispum"
                  titleSize={1.8}
                  titleColor={APPCOLORS.BLACK}
                />
              </View>

              <View
                style={{
                  width: responsiveWidth(80),
                  height: 1,
                  backgroundColor: APPCOLORS.BLACK,
                }}
              />

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View>
                  <View style={styles.container}>
                    <AppText
                      title="Order: "
                      titleSize={1.8}
                      titleColor={APPCOLORS.BLACK}
                      titleWeight
                    />
                    <AppText
                      title="10,000"
                      titleSize={1.8}
                      titleColor={APPCOLORS.BLACK}
                    />
                  </View>

                  <View style={styles.container}>
                    <AppText
                      title="Total: "
                      titleSize={1.8}
                      titleColor={APPCOLORS.BLACK}
                      titleWeight
                    />
                    <AppText
                      title="250,000"
                      titleSize={1.8}
                      titleColor={APPCOLORS.BLACK}
                    />
                  </View>
                </View>

                <View style={{alignItems: 'center'}}>
                  <AppText
                    title="Currency"
                    titleSize={1.8}
                    titleColor={APPCOLORS.BLACK}
                    titleWeight
                  />
                  <AppText
                    title="PKR"
                    titleSize={1.8}
                    titleColor={APPCOLORS.BLACK}
                  />
                </View>
              </View>

              <View
                style={{
                  width: responsiveWidth(80),
                  height: 1,
                  backgroundColor: APPCOLORS.BLACK,
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View>
                  <AppText
                    title="Required by"
                    titleSize={1.8}
                    titleColor={APPCOLORS.BLACK}
                    titleWeight
                  />
                  <AppText
                    title="11/23/2000"
                    titleSize={1.8}
                    titleColor={APPCOLORS.BLACK}
                  />
                </View>

                <View>
                  <AppText
                    title="Order Date"
                    titleSize={1.8}
                    titleColor={APPCOLORS.BLACK}
                    titleWeight
                  />
                  <AppText
                    title="11/22/2000"
                    titleSize={1.8}
                    titleColor={APPCOLORS.BLACK}
                  />
                </View>
              </View>
            </LinearGradient>
          );
        }}
      />
    </View>
  );
};

export default ViewAll;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
