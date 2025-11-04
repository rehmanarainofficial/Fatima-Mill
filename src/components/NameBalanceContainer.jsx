import {View, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import AppText from './AppText';
import {APPCOLORS} from '../utils/APPCOLORS';
import {responsiveWidth} from '../utils/Responsive';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NameBalanceContainer = ({Name, balance = 0, type, item}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container}>
      {/* Left: Name */}
      <View style={styles.nameContainer}>
        <AppText
          title={Name}
          titleSize={1.6}
          titleColor={APPCOLORS.BLACK}
          titleWeight
        />
      </View>

      {/* Middle: Balance */}
      <View style={styles.balanceContainer}>
        <AppText
          title={Math.round(balance).toLocaleString()}
          titleSize={1.5}
          titleColor={APPCOLORS.BLACK}
          titleWeight
        />
      </View>

      {/* Right: Icons */}
      {type === 'Receivable' || type === 'Payable' ? (
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={[styles.iconButton, {backgroundColor: '#E9F7EF'}]}
            onPress={() => navigation.navigate('Aging', {name: type, item})}>
            <Icon name="clock-outline" size={20} color="#2E7D32" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, {backgroundColor: '#E3F2FD'}]}
            onPress={() => navigation.navigate('Ledger', {name: type, item})}>
            <Icon name="book-open-outline" size={20} color="#1565C0" />
          </TouchableOpacity>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default NameBalanceContainer;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
  },
  nameContainer: {
    width: responsiveWidth(35),
  },
  balanceContainer: {
    width: responsiveWidth(25),
    alignItems: 'flex-end',
  },
  iconContainer: {
    width: responsiveWidth(25),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
