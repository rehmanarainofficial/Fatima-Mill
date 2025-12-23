import { Dimensions } from "react-native";

const percentageCalculation = (max: number, val: number): number => max * (val / 100);

const fontCalculation = (height: number, width: number, val: number): number => {
  const widthDimension = height > width ? width : height;
  const aspectRatioBasedHeight = (16 / 9) * widthDimension;
  return percentageCalculation(
    Math.sqrt(Math.pow(aspectRatioBasedHeight, 2) + Math.pow(widthDimension, 2)),
    val
  );
};

export const responsiveFontSize = (f: number): number => {
  const { width } = Dimensions.get("window");
  // Use a more predictable scaling: base width of 360 (Google Pixel / small iPhone size)
  // Using 360 instead of 375 to make scaling slightly more generous on iPhones.
  const scale = width / 360;
  const newSize = f * 8.5 * scale; // 8.5 is a multiplier to keep it proportional to the old system's 1-4 scale
  return Math.round(newSize);
};

export const responsiveHeight = (h: number): number => {
  const { height } = Dimensions.get("window");
  return height * (h / 100);
};

export const responsiveWidth = (w: number): number => {
  const { width } = Dimensions.get("window");
  return width * (w / 100);
};