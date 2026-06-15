import React from 'react';
import {TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// Custom component for a pressable button with a scale animation (zoom-in/out effect)
const AnimatedButton = ({children, onPress, style}) => {
  const scale = useSharedValue(1); // Shared value for scale animation

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}], // Apply scale to the component
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {damping: 10, stiffness: 100}); // Slightly scale down on press
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 10, stiffness: 100}); // Scale back to original size
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={1} // Important: Set activeOpacity to 1 as the animation handles feedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{flex: 1}}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;
