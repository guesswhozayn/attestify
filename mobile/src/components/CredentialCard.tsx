import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, Calendar, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { theme } from '../theme/theme';
import GlassCard from './GlassCard';

interface CredentialCardProps {
  credential: any;
  onPress?: () => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, onPress }) => {
  const isRevoked = credential.isRevoked || credential.status === 'REVOKED';
  const dateStr = new Date(credential.issueDate || credential.createdAt).toLocaleDateString();
  const institution = credential.university || (credential.issuedBy && credential.issuedBy.university) || 'Institution';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <GlassCard style={[styles.card, isRevoked && styles.revokedCard]}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: isRevoked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
            <Award color={isRevoked ? theme.colors.error : theme.colors.primary} size={22} />
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isRevoked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' }
          ]}>
            <View style={[styles.dot, { backgroundColor: isRevoked ? theme.colors.error : theme.colors.success }]} />
            <Text style={[
              styles.statusText, 
              { color: isRevoked ? theme.colors.error : theme.colors.success }
            ]}>
              {isRevoked ? 'REVOKED' : 'VERIFIED'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.studentName} numberOfLines={1}>{credential.studentName}</Text>
          <Text style={styles.programName} numberOfLines={1}>
            {credential.programName || credential.certificationData?.title || 'Credential'}
          </Text>
          <Text style={styles.institution} numberOfLines={1}>{institution}</Text>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.footerItem}>
             <Calendar size={12} color={theme.colors.textDim} />
             <Text style={styles.footerText}>{dateStr}</Text>
          </View>
          <View style={styles.footerItem}>
             <ShieldCheck size={12} color={isRevoked ? theme.colors.textDim : theme.colors.primary} />
             <Text style={styles.footerText}>{credential.type || 'SBT'}</Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  revokedCard: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 16,
  },
  studentName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  programName: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  institution: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CredentialCard;
