import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../components/Header';

const DeliveryScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Header
        title="Delivery"
        onBack={() => navigation.goBack()}
      />

      {/* Content */}
      <View style={styles.content}>
        <MIcon name="truck-delivery-outline" size={80} color="#795548" />
        <Text style={styles.title}>Delivery Status</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          We are currently working on this feature. It will be available in a
          future update!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#795548',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
});

export default DeliveryScreen;
