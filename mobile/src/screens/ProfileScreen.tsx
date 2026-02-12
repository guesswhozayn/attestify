import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { User, Building, Mail, Shield, Wallet, MapPin, Globe, Calendar, LogOut, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const isInstitute = user?.role === 'INSTITUTE';

  const renderInfoItem = (icon: React.ReactNode, label: string, value: string) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Avatar Section */}
        <View style={styles.header}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    {isInstitute ? <Building size={40} color="#fff" /> : <User size={40} color="#fff" />}
                </View>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role}</Text>
                </View>
            </View>
            <Text style={styles.name}>{isInstitute ? user?.instituteDetails?.institutionName : user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Action Quick Links */}
        <GlassCard style={styles.walletCard}>
            <View style={styles.walletHeader}>
                <Wallet size={20} color={theme.colors.success} />
                <Text style={styles.walletTitle}>Blockchain Wallet</Text>
            </View>
            <Text style={styles.walletAddress}>
                {isInstitute ? user?.instituteDetails?.authorizedWalletAddress : user?.studentDetails?.walletAddress || 'No wallet connected'}
            </Text>
            <TouchableOpacity style={styles.copyBtn}>
                <Text style={styles.copyBtnText}>Copy Address</Text>
            </TouchableOpacity>
        </GlassCard>

        {/* Detailed Info */}
        <Text style={styles.sectionTitle}>Account Details</Text>
        <GlassCard style={styles.infoCard}>
            {isInstitute ? (
                <>
                    {renderInfoItem(<Shield size={18} color={theme.colors.primary} />, "Registration No", user?.instituteDetails?.registrationNumber)}
                    {renderInfoItem(<Globe size={18} color={theme.colors.primary} />, "Email Domain", user?.instituteDetails?.officialEmailDomain)}
                    {renderInfoItem(<Mail size={18} color={theme.colors.primary} />, "Contact Email", user?.email)}
                </>
            ) : (
                <>
                    {renderInfoItem(<Building size={18} color={theme.colors.primary} />, "Institution", user?.studentDetails?.university)}
                    {renderInfoItem(<Calendar size={18} color={theme.colors.primary} />, "Joined", new Date(user?.createdAt).toLocaleDateString())}
                    {renderInfoItem(<Mail size={18} color={theme.colors.primary} />, "Primary Email", user?.email)}
                </>
            )}
        </GlassCard>

        {/* Settings Links */}
        <Text style={styles.sectionTitle}>More</Text>
        <GlassCard style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                        <User size={18} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.menuText}>Edit Profile</Text>
                </View>
                <ChevronRight size={18} color={theme.colors.textDim} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={logout}>
                <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                        <LogOut size={18} color={theme.colors.error} />
                    </View>
                    <Text style={[styles.menuText, { color: theme.colors.error }]}>Sign Out</Text>
                </View>
                <ChevronRight size={18} color={theme.colors.textDim} />
            </TouchableOpacity>
        </GlassCard>

      </ScrollView>
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
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  walletCard: {
    padding: theme.spacing.md,
    marginBottom: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  walletTitle: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  walletAddress: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  copyBtn: {
    alignSelf: 'center',
  },
  copyBtnText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    padding: theme.spacing.md,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  infoValue: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  infoContent: {
    flex: 1,
  },
  menuCard: {
    padding: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  }
});

export default ProfileScreen;
