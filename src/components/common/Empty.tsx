
// src/components/common/Empty.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface EmptyProps {
  message: string;
  icon?: React.ReactNode;
}

export const Empty: React.FC<EmptyProps> = ({ message, icon }) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
