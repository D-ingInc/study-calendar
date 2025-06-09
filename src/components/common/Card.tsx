
// src/components/common/Card.tsx

import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
} from 'react-native';

interface CardProps extends ViewProps {
  padding?: number;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 16,
  shadow = true,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        shadow && styles.shadow,
        { padding },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});