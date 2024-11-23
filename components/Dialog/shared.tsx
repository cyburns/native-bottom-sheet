import React from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

export function Header({
  renderLeft,
  renderRight,
  children,
  style,
}: {
  renderLeft?: () => React.ReactNode;
  renderRight?: () => React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[style]}>
      {renderLeft && <View style={[{ left: 6 }]}>{renderLeft()}</View>}
      {children}
      {renderRight && <View style={[{ right: 6 }]}>{renderRight()}</View>}
    </View>
  );
}

export function HeaderText({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[style]}>{children}</Text>;
}
