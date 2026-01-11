import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { APPCOLORS } from '../../../../utils/APPCOLORS';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../../utils/Responsive';

const PdfScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

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

        <Text style={styles.headerTitle}>PDF</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={{ padding: 5 }}>
          <Ionicons
            name="person"
            size={responsiveFontSize(3)}
            color={APPCOLORS.WHITE}
          />
        </TouchableOpacity>
      </LinearGradient>
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

export default PdfScreen;
