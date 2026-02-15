import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import GlassCard from '../components/GlassCard';

const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ISSUER' | 'STUDENT'>('ISSUER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await login({ email, password, role: selectedRole });
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Background Ambience Placeholders (Simulated with views) */}
          <View style={[styles.ambience, { top: -100, left: -100, backgroundColor: 'rgba(99, 102, 241, 0.1)' }]} />
          <View style={[styles.ambience, { bottom: -100, right: -100, backgroundColor: 'rgba(168, 85, 247, 0.1)' }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield color="#fff" size={32} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your Attestify account</Text>
          </View>

          {/* Login Card */}
          <GlassCard style={styles.card}>
            
            {/* Role Toggle */}
            <View style={styles.roleToggle}>
              <TouchableOpacity 
                style={[styles.roleBtn, selectedRole === 'ISSUER' && styles.roleBtnActive]}
                onPress={() => setSelectedRole('ISSUER')}
              >
                <Text style={[styles.roleText, selectedRole === 'ISSUER' && styles.roleTextActive]}>
                  Issuer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleBtn, selectedRole === 'STUDENT' && styles.roleBtnActive]}
                onPress={() => setSelectedRole('STUDENT')}
              >
                <Text style={[styles.roleText, selectedRole === 'STUDENT' && styles.roleTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Email Address"
              placeholder={selectedRole === 'ISSUER' ? "issuer@univ.edu" : "student@univ.edu"}
              value={email}
              onChangeText={setEmail}
              icon={<Mail size={20} color={theme.colors.textDim} />}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon={<Lock size={20} color={theme.colors.textDim} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={theme.colors.textDim} /> : <Eye size={20} color={theme.colors.textDim} />}
                </TouchableOpacity>
              }
            />

            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotPassText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              loading={loading}
              icon={!loading && <ArrowRight size={20} color="#fff" />}
              style={styles.loginBtn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Register')}>
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </View>

          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  ambience: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    // Add gradient placeholder feel here if needed
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  card: {
    marginTop: theme.spacing.md,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    padding: 4,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  roleBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  roleText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  roleTextActive: {
    color: '#fff',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  forgotPassText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});

export default LoginScreen;
