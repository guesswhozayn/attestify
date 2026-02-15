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
import { Shield, Plus, LayoutGrid, Filter, LogOut } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { credentialAPI } from '../services/api';
import StatCard from '../components/StatCard';
import CredentialCard from '../components/CredentialCard';
import GlassCard from '../components/GlassCard';

const IssuerDashboardScreen = () => {
  const { user, logout } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allResponse, statsResponse] = await Promise.all([
        credentialAPI.getAll({ limit: 5 }),
        credentialAPI.getStats()
      ]);
      
      setCredentials(allResponse.data.credentials || []);
      setStats(statsResponse.data.stats || { total: 0, active: 0, revoked: 0 });
    } catch (error) {
      console.error('Dashboard fetch error', error);
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
      
      {/* Navbar Helper for Mobile */}
      <View style={styles.nav}>
        <View style={styles.navLeft}>
            <View style={styles.logoCircle}>
                <Shield color="#fff" size={18} />
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
        {/* Welcome Banner */}
        <GlassCard style={styles.banner}>
          <View style={styles.badge}>
            <Shield size={12} color={theme.colors.primary} />
            <Text style={styles.badgeText}>ISSUER ACCESS</Text>
          </View>
          <Text style={styles.welcomeText}>
            Welcome, <Text style={styles.highlight}>{user?.issuerDetails?.institutionName || user?.name || 'Issuer'}</Text>
          </Text>
          <Text style={styles.bannerSubtitle}>Manage and issue secure blockchain credentials.</Text>
          
          <TouchableOpacity style={styles.issueBtn}>
            <Plus color="#fff" size={20} />
            <Text style={styles.issueBtnText}>Issue New Credential</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard 
            label="Total" 
            value={stats.total} 
            icon={Shield} 
          />
          <View style={{ width: theme.spacing.md }} />
          <StatCard 
            label="Active" 
            value={stats.active} 
            icon={LayoutGrid} 
            color={theme.colors.success}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard 
            label="Revoked" 
            value={stats.revoked} 
            icon={Filter} 
            color={theme.colors.error}
          />
          <View style={{ width: theme.spacing.md }} />
          <View style={{ flex: 1 }} /> 
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading activity...</Text>
          </View>
        ) : credentials.length > 0 ? (
          credentials.map((cred: any) => (
            <CredentialCard key={cred._id} credential={cred} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No credentials issued yet.</Text>
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
  banner: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 12,
    gap: 4,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  welcomeText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  highlight: {
    color: theme.colors.primary,
  },
  bannerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  issueBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  issueBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  viewAll: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.textDim,
  }
});

export default IssuerDashboardScreen;
