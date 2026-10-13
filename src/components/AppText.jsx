import {Text} from 'react-native';
import React from 'react';
import {responsiveFontSize, responsiveWidth} from '../utils/Responsive';

const AppText = ({
  title,
  titleSize = 1.5,
  titleWeight,
  titleSizeWeight,
  titleAlignment,
  titleColor,
  numberOfLines,
  ellipsizeMode,
}) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={{
        fontSize: responsiveFontSize(titleSize),
        color: titleColor,
        fontWeight: titleWeight ? 'bold' : 'regular',
        width: titleSizeWeight ? responsiveWidth(titleSizeWeight) : null,
        textAlign: titleAlignment,
      }}>
      {title}
    </Text>
  );
};

export default AppText;
