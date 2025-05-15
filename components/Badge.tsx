import React, { ReactNode } from 'react';
import { StyleSheet, View, Text } from 'react-native';

type BadgeProps = {
  label: string;
  color: string;
  icon?: ReactNode;
};

export function Badge({ label, color, icon }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: `${color}20` }]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
});