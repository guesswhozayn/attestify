import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import GlassCard from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, subtitle, color }) => {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color ? `${color}20` : 'rgba(99, 102, 241, 0.1)' }]}>
          <Icon color={color || theme.colors.primary} size={24} />
        </View>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  label: {
    color: theme.colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  value: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});

export default StatCard;
