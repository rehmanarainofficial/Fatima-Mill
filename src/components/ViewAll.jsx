import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import AppText from './AppText';


const ViewAll = ({onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <AppText title="View all" titleSize={2} titleWeight />
    </TouchableOpacity>
  );
};

export default ViewAll;
