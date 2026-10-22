import { Dimensions } from 'react-native';


export const responsiveFontSize = (f: number): number => {
  const { width } = Dimensions.get('window');
  const scale = width / 360;
  const newSize = f * 8.5 * scale;
  return Math.round(newSize);
};

export const responsiveHeight = (h: number): number => {
  const { height } = Dimensions.get('window');
  return height * (h / 100);
};

export const responsiveWidth = (w: number): number => {
  const { width } = Dimensions.get('window');
  return width * (w / 100);
};
