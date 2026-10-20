import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  responsiveFontSize,
  responsiveWidth,
} from '../utils/Responsive';
import { APPCOLORS } from '../utils/APPCOLORS';

const AppDatePicker = ({
  visible,
  value,
  onClose,
  onChange,
  title = 'Select Date',
  maximumDate,
  minimumDate,
}) => {
  if (!visible) {
    return null;
  }

  const currentDate = value instanceof Date && !isNaN(value.getTime())
    ? value
    : new Date();

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={currentDate}
        mode="date"
        display="default"
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        onChange={(event, selectedDate) => {
          onClose();
          if (event.type === 'set' && selectedDate) {
            onChange(selectedDate);
          }
        }}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={currentDate}
              mode="date"
              display={Platform.Version >= 14 ? 'inline' : 'spinner'}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              themeVariant="light"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  onChange(selectedDate);
                }
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.8}
            onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AppDatePicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: responsiveWidth(88),
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
    color: '#1F2937',
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  doneBtn: {
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: responsiveFontSize(1.9),
  },
});
