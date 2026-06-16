import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {responsiveHeight} from '../../../../utils/Responsive';

const DeliveryScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.headerTop,
          {
            height:
              Platform.OS === 'ios'
                ? responsiveHeight(8) + insets.top
                : responsiveHeight(8) + insets.top,
            paddingTop: insets.top,
            width: width,
          },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Delivery</Text>

        <View style={{width: 36}} />
      </View>

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
  headerTop: {
    backgroundColor: '#0784B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
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
