import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  style?: any;
}

const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  loading = false, 
  disabled = false, 
  variant = 'primary',
  icon,
  style
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const Container = (isPrimary && !disabled) ? LinearGradient : View;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      style={[
        styles.base,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        disabled && styles.disabled,
        style
      ]}
    >
      <Container
        colors={['#6366f1', '#a855f7', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.content}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? '#fff' : theme.colors.primary} />
        ) : (
          <View style={styles.inner}>
            <Text style={[
              styles.text,
              (isOutline || isGhost) && { color: theme.colors.primary }
            ]}>
              {title}
            </Text>
            {icon && <View style={styles.icon}>{icon}</View>}
          </View>
        )}
      </Container>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    height: 56,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  icon: {
    marginLeft: theme.spacing.sm,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  }
});

export default Button;
