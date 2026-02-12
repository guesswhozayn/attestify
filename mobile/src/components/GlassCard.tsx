import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.7)', // gray-900 with 70% opacity
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)', // gray-700 with 50% opacity
    padding: theme.spacing.lg,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
});

export default GlassCard;
