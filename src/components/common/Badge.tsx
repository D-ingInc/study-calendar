
// src/components/common/Badge.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = '#FFF',
  backgroundColor = '#007AFF',
}) => {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
