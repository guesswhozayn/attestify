import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import { Activity, Clock, ShieldAlert, User, Globe } from 'lucide-react-native';
import { auditAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import { theme } from '../theme/theme';

const AuditLogsScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await auditAPI.getLogs();
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Audit logs fetch error', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getLogIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'issue': return <ShieldAlert size={16} color={theme.colors.success} />;
      case 'revoke': return <ShieldAlert size={16} color={theme.colors.error} />;
      case 'login': return <User size={16} color={theme.colors.primary} />;
      default: return <Activity size={16} color={theme.colors.textMuted} />;
    }
  };

  const renderLogMessage = (item: any) => {
    const details = item.details || item.message;
    
    if (!details) return 'No details available';
    
    if (typeof details === 'object') {
      // Handle verification specific object mentioned in error
      if (details.inputIdentifier) {
        return `Verified ID: ${details.inputIdentifier}. Match: ${details.hashMatch ? 'Yes' : 'No'}. Blockchain: ${details.blockchainValid ? 'Valid' : 'Invalid'}`;
      }
      // Generic fallback for other objects
      return JSON.stringify(details);
    }
    
    return details;
  };

  const renderLogItem = ({ item }: { item: any }) => {
    const isLogin = item.action?.toLowerCase() === 'login';
    const isIssue = item.action?.toLowerCase().includes('issue');
    const isRevoke = item.action?.toLowerCase().includes('revoke');

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.wrapper}>
        <GlassCard style={styles.logCard}>
          <View style={styles.logHeader}>
            <View style={[
              styles.actionBadge,
              { backgroundColor: isIssue ? 'rgba(99, 102, 241, 0.1)' : isRevoke ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }
            ]}>
              {getLogIcon(item.action)}
              <Text style={[
                styles.logAction,
                { color: isIssue ? theme.colors.primary : isRevoke ? theme.colors.error : theme.colors.success }
              ]}>
                {item.action.toUpperCase()}
              </Text>
            </View>
            <View style={styles.timeWrapper}>
              <Clock size={12} color={theme.colors.textDim} />
              <Text style={styles.logTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
          
          <Text style={styles.logMessage}>{renderLogMessage(item)}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.logFooter}>
            <View style={styles.userSection}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || 'S'}</Text>
              </View>
              <Text style={styles.logUser}>{item.user?.name || 'System'}</Text>
            </View>
            <Text style={styles.logDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>System Audit</Text>
        <Text style={styles.subtitle}>Immutable blockchain records & activity logs</Text>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item: any) => item._id}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Activity size={48} color={theme.colors.textDim} strokeWidth={1} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No activity recorded</Text>
            <Text style={styles.emptySubtext}>New system events will appear here in real-time.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  logCard: {
    padding: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  logAction: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logTime: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logMessage: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 16,
    opacity: 0.9,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  logUser: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600',
  },
  logDate: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: theme.colors.textDim,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  }
});

export default AuditLogsScreen;
