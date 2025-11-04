import {View, Text} from 'react-native';
import React from 'react';
import SimpleHeader from '../../../../components/SimpleHeader';
import AppButton from '../../../../components/AppButton';
import AppText from '../../../../components/AppText';

const AgingAndLedger = ({navigation, route}) => {
  const {name, item} = route.params;
  return (
    <View style={{flex: 1}}>
      <SimpleHeader title={'Select Aging or ledger'} />
      {name == 'Customer' || name == 'Suppliers' ? (
        <View style={{marginTop: 50, gap: 20}}>
          <AppButton
            title="Aging"
            btnWidth={90}
            onPress={() =>
              navigation.navigate('Aging', {name: name, item: item})
            }
          />
          <AppButton
            title="Ledger"
            btnWidth={90}
            onPress={() =>
              navigation.navigate('Ledger', {name: name, item: item})
            }
          />
        </View>
      ) : (
        <AppText title="There is no ledger or aging for this user" />
      )}
    </View>
  );
};

export default AgingAndLedger;
