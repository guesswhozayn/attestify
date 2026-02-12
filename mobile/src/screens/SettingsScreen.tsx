import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { User, Lock, Mail, Save, Shield, ChevronLeft } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Input from '../components/Input';

const SettingsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    about: user?.about || '',
    title: user?.studentDetails?.title || '',
  });

  // Security State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    // Placeholder for API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully');
    }, 1500);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    // Placeholder for API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1500);
  };

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
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'profile' && styles.activeTab]} 
              onPress={() => setActiveTab('profile')}
            >
              <User size={18} color={activeTab === 'profile' ? '#fff' : theme.colors.textDim} />
              <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'security' && styles.activeTab]} 
              onPress={() => setActiveTab('security')}
            >
              <Shield size={18} color={activeTab === 'security' ? '#fff' : theme.colors.textDim} />
              <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>Security</Text>
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.card}>
            {activeTab === 'profile' ? (
              <View style={styles.form}>
                <Input
                  label="Display Name"
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                  icon={<User size={20} color={theme.colors.textDim} />}
                />
                
                {user?.role === 'STUDENT' && (
                    <Input
                        label="Professional Title"
                        value={profileData.title}
                        onChangeText={(text) => setProfileData({ ...profileData, title: text })}
                        icon={<Shield size={20} color={theme.colors.textDim} />}
                    />
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bio / About</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                    value={profileData.about}
                    onChangeText={(text) => setProfileData({ ...profileData, about: text })}
                    placeholderTextColor={theme.colors.textDim}
                    placeholder="Tell us a bit about yourself..."
                  />
                </View>

                <Button
                  title="Save Changes"
                  onPress={handleProfileUpdate}
                  loading={loading}
                  icon={<Save size={20} color="#fff" />}
                  style={styles.actionBtn}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Current Password"
                  secureTextEntry
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  icon={<Lock size={20} color={theme.colors.textDim} />}
                />
                <Input
                  label="New Password"
                  secureTextEntry
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  icon={<Lock size={20} color={theme.colors.textDim} />}
                />
                <Input
                  label="Confirm New Password"
                  secureTextEntry
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  icon={<Lock size={20} color={theme.colors.textDim} />}
                />

                <Button
                  title="Update Password"
                  onPress={handlePasswordUpdate}
                  loading={loading}
                  variant="primary"
                  style={styles.actionBtn}
                />
              </View>
            )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  backBtn: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    padding: theme.spacing.lg,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  textArea: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionBtn: {
    marginTop: 12,
  }
});

export default SettingsScreen;
