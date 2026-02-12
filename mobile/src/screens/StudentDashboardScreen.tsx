import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  StatusBar
} from 'react-native';
import { Wallet, Award, Share2, ExternalLink, LogOut, ShieldCheck } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { credentialAPI } from '../services/api';
import CredentialCard from '../components/CredentialCard';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const StudentDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [walletAddress, setWalletAddress] = useState('0x71C...394e'); // Mock wallet for now
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // In real scenario, we'd get wallet from a hook or provider
      const response = await credentialAPI.getAll({ limit: 5 }); 
      setCredentials(response.data.credentials || []);
    } catch (error) {
      console.error('Student Dashboard fetch error', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Navbar Helper */}
      <View style={styles.nav}>
        <View style={styles.navLeft}>
            <View style={styles.logoCircle}>
                <ShieldCheck color="#fff" size={18} />
            </View>
            <Text style={styles.navTitle}>Attestify</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut size={20} color={theme.colors.textDim} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.header}>
            <Text style={styles.title}>Welcome back, {user?.name?.split(' ')[0] || 'Student'}</Text>
            <Text style={styles.subtitle}>Your verified academic achievements on the blockchain.</Text>
        </View>

        {/* Wallet Connection Status */}
        <GlassCard style={styles.walletCard}>
            <View style={styles.walletInfo}>
                <View style={styles.walletIconContainer}>
                    <Wallet color={theme.colors.success} size={24} />
                </View>
                <View>
                    <Text style={styles.walletLabel}>Connected Wallet</Text>
                    <Text style={styles.walletValue}>{walletAddress}</Text>
                </View>
            </View>
            <View style={styles.walletStatusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>ACTIVE</Text>
            </View>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
            <Button 
                variant="outline"
                title="Share Verification"
                onPress={() => {}}
                icon={<Share2 size={18} color={theme.colors.primary} />}
                style={{ flex: 1 }}
            />
        </View>

        {/* Content Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Credentials</Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading credentials...</Text>
          </View>
        ) : credentials.length > 0 ? (
          credentials.map((cred: any) => (
            <CredentialCard 
              key={cred._id} 
              credential={cred} 
              onPress={() => navigation.navigate('CredentialDetail', { credential: cred })}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Award size={48} color={theme.colors.textDim} strokeWidth={1} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No credentials found yet.</Text>
            <Text style={styles.emptySubtext}>Once issued by your institution, they will appear here.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  nav: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  logoutBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    marginVertical: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  walletValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  walletStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  statusText: {
    color: theme.colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textDim,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtext: {
    color: theme.colors.textDim,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default StudentDashboardScreen;
