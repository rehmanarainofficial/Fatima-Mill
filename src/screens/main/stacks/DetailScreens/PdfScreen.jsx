import { View } from 'react-native';
import React from 'react';
import Header from '../../../../components/Header';

const PdfScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header
        title="PDF"
        onBack={() => navigation.goBack()}
        rightIcon="person"
        onRightPress={() => navigation.navigate('Dashboard')}
      />
    </View>
  );
};

export default PdfScreen;
