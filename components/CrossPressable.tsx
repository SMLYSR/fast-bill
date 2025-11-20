import React from 'react';
import { Pressable } from 'react-native';

type Props = {
  onPress?: () => void;
  style?: any;
  children?: React.ReactNode;
  disabled?: boolean;
  accessibilityRole?: string;
};

export default function CrossPressable({ onPress, style, children, disabled, accessibilityRole }: Props) {
  return (
    <Pressable style={style} onPress={onPress} disabled={disabled} accessibilityRole={accessibilityRole as any}>
      {children}
    </Pressable>
  );
}