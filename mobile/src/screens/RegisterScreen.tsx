import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import { Shield, User, Mail, Lock, Building, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import GlassCard from '../components/GlassCard';

const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    registrationNumber: '',
    walletAddress: '',
    authorizedWalletAddress: '',
    officialEmailDomain: '',
    institutionName: '',
    role: 'ISSUER',
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      Alert.alert('Success', 'Registration successful! Please login to continue.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const isIssuer = formData.role === 'ISSUER';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft color={theme.colors.textMuted} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Shield color="#fff" size={32} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the decentralized credential network</Text>
          </View>

          {/* Role Toggle */}
          <View style={styles.roleToggleContainer}>
            <View style={styles.roleToggle}>
              <View 
                style={[
                  styles.toggleActive, 
                  { left: isIssuer ? 4 : '50%' }
                ]}  
              />
              <TouchableOpacity 
                style={styles.toggleBtn} 
                onPress={() => handleChange('role', 'ISSUER')}
              >
                <Text style={[styles.toggleText, isIssuer && styles.toggleTextActive]}>Issuer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.toggleBtn} 
                onPress={() => handleChange('role', 'STUDENT')}
              >
                <Text style={[styles.toggleText, !isIssuer && styles.toggleTextActive]}>Student</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <GlassCard style={styles.card}>
            {/* General Fields */}
            {!isIssuer && (
              <Input
                label="Full Name"
                placeholder="e.g. Alex Johnson"
                icon={<User size={20} color={theme.colors.textDim} />}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            )}

            <Input
              label="Email Address"
              placeholder={isIssuer ? "issuer@university.edu" : "student@university.edu"}
              icon={<Mail size={20} color={theme.colors.textDim} />}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />

            {isIssuer ? (
              <>
                <Input
                  label="Organization Name"
                  placeholder="e.g. University of Tech"
                  icon={<Building size={20} color={theme.colors.textDim} />}
                  value={formData.institutionName}
                  onChangeText={(text) => handleChange('institutionName', text)}
                />
                <Input
                  label="Registration / License No"
                  placeholder="e.g. REG-2024-X89"
                  icon={<Shield size={20} color={theme.colors.textDim} />}
                  value={formData.registrationNumber}
                  onChangeText={(text) => handleChange('registrationNumber', text)}
                />
                <Input
                  label="Authorized Wallet Address"
                  placeholder="0x..."
                  icon={<Lock size={20} color={theme.colors.textDim} />}
                  value={formData.authorizedWalletAddress}
                  onChangeText={(text) => handleChange('authorizedWalletAddress', text)}
                />
                <Input
                  label="Official Email Domain"
                  placeholder="@university.edu"
                  icon={<Mail size={20} color={theme.colors.textDim} />}
                  value={formData.officialEmailDomain}
                  onChangeText={(text) => handleChange('officialEmailDomain', text)}
                />
              </>
            ) : (
              <>
                <Input
                  label="University / Organization"
                  placeholder="Select your university/organization"
                  icon={<Building size={20} color={theme.colors.textDim} />}
                  value={formData.university}
                  onChangeText={(text) => handleChange('university', text)}
                />
                <Input
                  label="Wallet Address"
                  placeholder="0x..."
                  icon={<Lock size={20} color={theme.colors.textDim} />}
                  value={formData.walletAddress}
                  onChangeText={(text) => handleChange('walletAddress', text)}
                />
              </>
            )}

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              icon={<Lock size={20} color={theme.colors.textDim} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={theme.colors.textDim} /> : <Eye size={20} color={theme.colors.textDim} />}
                </TouchableOpacity>
              }
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              secureTextEntry
              icon={<Lock size={20} color={theme.colors.textDim} />}
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
            />

            <Button
              title={loading ? "Creating Account..." : "Create Account"}
              onPress={handleRegister}
              loading={loading}
              icon={!loading && <ArrowRight size={20} color="#fff" />}
              style={styles.registerBtn}
            />
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // Glow effect
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  roleToggleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 4,
    width: '100%',
    maxWidth: 300,
    position: 'relative',
  },
  toggleActive: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '48%',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#fff',
  },
  card: {
    marginBottom: 24,
  },
  registerBtn: {
    marginTop: 10,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RegisterScreen;
