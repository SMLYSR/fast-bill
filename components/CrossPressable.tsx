import React from 'react';
import { Platform, Pressable, View } from 'react-native';

type Props = {
  onPress?: () => void;
  style?: any;
  children?: React.ReactNode;
  disabled?: boolean;
  accessibilityRole?: string;
};

export default function CrossPressable({ onPress, style, children, disabled, accessibilityRole }: Props) {
  if (Platform.OS === 'web') {
    return (
      <View style={style} onClick={disabled ? undefined : onPress} role={accessibilityRole as any}>
        {children}
      </View>
    );
  }
  return (
    <Pressable style={style} onPress={onPress} disabled={disabled} accessibilityRole={accessibilityRole as any}>
      {children}
    </Pressable>
  );
}