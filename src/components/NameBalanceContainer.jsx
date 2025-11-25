import {View, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import AppText from './AppText';
import {APPCOLORS} from '../utils/APPCOLORS';
import {responsiveWidth} from '../utils/Responsive';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NameBalanceContainer = ({
  Name,
  balance = 0,
  type,
  item,
  fromViewAll = false,
}) => {
  const navigation = useNavigation();

  const showAgingAndLedger = type === 'Receivable' || type === 'Payable';
  const showInventoryLedger = type === 'Inventory Valuation';
  const showBankLedger = type === 'Bank & Cash';

  const handlePress = () => {
    if (type === 'Inventory Valuation') {
      navigation.navigate('StockMovements', {
        item: item,
        fromAllMovements: fromViewAll,
      });
    }
    if (type === 'Bank & Cash') {
      navigation.navigate('Ledgers', {
        item: item,
        type: 'Bank & Cash',
      });
    }
  };

  const handleInventoryIconPress = () => {
    const categoryId = item?.category_id || '';

    navigation.navigate('StockSheetScreen', {
      category_id: categoryId,
      item: item,
    });
  };

  const handleBankIconPress = () => {
    navigation.navigate('Ledgers', {
      item: item,
      type: 'Bank & Cash',
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={handlePress}>
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
      <View style={styles.iconContainer}>
        {/* Receivable & Payable - Aging + Ledger */}
        {showAgingAndLedger && (
          <>
            <TouchableOpacity
              style={[styles.iconButton, {backgroundColor: '#E9F7EF'}]}
              onPress={() =>
                navigation.navigate('Aging', {
                  name: type === 'Receivable' ? 'Customer' : 'Suppliers',
                  item,
                })
              }>
              <Icon name="clock-outline" size={20} color="#2E7D32" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, {backgroundColor: '#E3F2FD'}]}
              onPress={() =>
                navigation.navigate('Ledgers', {
                  item: item,
                  type: type,
                })
              }>
              <Icon name="book-open-outline" size={20} color="#1565C0" />
            </TouchableOpacity>
          </>
        )}

        {/* Inventory Valuation - Stock Movements Icon */}
        {showInventoryLedger && (
          <TouchableOpacity
            style={[styles.iconButton, {backgroundColor: '#E3F2FD'}]}
            onPress={handleInventoryIconPress}>
            <Icon name="swap-horizontal" size={20} color="#1565C0" />
          </TouchableOpacity>
        )}

        {/* Bank & Cash - Ledger Icon */}
        {showBankLedger && (
          <TouchableOpacity
            style={[styles.iconButton, {backgroundColor: '#E3F2FD'}]}
            onPress={handleBankIconPress}>
            <Icon name="book-open-outline" size={20} color="#1565C0" />
          </TouchableOpacity>
        )}

        {/* Salesman, etc. - No buttons */}
        {!showAgingAndLedger && !showInventoryLedger && !showBankLedger && (
          <View style={styles.placeholder} />
        )}
      </View>
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
  },
  nameContainer: {
    width: responsiveWidth(30),
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
    minHeight: 36,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 36,
    height: 36,
  },
});
