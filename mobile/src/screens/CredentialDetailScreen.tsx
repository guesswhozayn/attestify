import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Share,
  Linking
} from 'react-native';
import { 
  Award, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Share2, 
  ArrowLeft,
  ChevronRight,
  User,
  Hash,
  Activity,
  Box,
  Fingerprint
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const CredentialDetailScreen = ({ route, navigation }: any) => {
  const { credential } = route.params;
  const isRevoked = credential.isRevoked || credential.status === 'REVOKED';

  const handleShare = async () => {
    try {
      const verificationUrl = `https://attestify.io/verify/${credential._id}`;
      await Share.share({
        message: `Check out my verified credential: ${credential.type} in ${credential.programName || credential.certificationData?.title}. Verified on Attestify: ${verificationUrl}`,
        url: verificationUrl,
      });
    } catch (error: any) {
      console.error('Share error:', error.message);
    }
  };

  const openEtherscan = () => {
    const url = `https://sepolia.etherscan.io/tx/${credential.transactionHash}`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const DetailItem = ({ label, value, icon: Icon }: any) => (
    <View style={styles.detailItem}>
      <View style={styles.detailLabelRow}>
        <Icon size={16} color={theme.colors.textDim} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">{value || 'N/A'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Share2 size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Certificate Badge Card */}
        <GlassCard style={styles.badgeCard}>
          <View style={[
            styles.iconCircle,
            { backgroundColor: isRevoked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)' }
          ]}>
            <Award size={40} color={isRevoked ? theme.colors.error : theme.colors.primary} />
          </View>
          
          <Text style={styles.credentialTitle}>{credential.type}</Text>
          <Text style={styles.programName}>{credential.programName || credential.certificationData?.title || 'Certification'}</Text>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: isRevoked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }
          ]}>
            {isRevoked ? <ShieldAlert size={14} color={theme.colors.error} /> : <ShieldCheck size={14} color={theme.colors.success} />}
            <Text style={[
              styles.statusText,
              { color: isRevoked ? theme.colors.error : theme.colors.success }
            ]}>
              {isRevoked ? 'REVOKED' : 'VERIFIED'}
            </Text>
          </View>
        </GlassCard>

        {/* Student & Institution Info */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Identification</Text>
        </View>
        
        <GlassCard style={styles.infoCard}>
          <DetailItem label="Student Name" value={credential.studentName} icon={User} />
          <View style={styles.divider} />
          <DetailItem label="Issued By" value={credential.university || credential.issuedBy?.university} icon={Activity} />
          <View style={styles.divider} />
          <DetailItem label="Issue Date" value={new Date(credential.issueDate || credential.createdAt).toLocaleDateString()} icon={Calendar} />
          <View style={styles.divider} />
          <DetailItem label="Wallet Address" value={credential.studentWalletAddress} icon={Hash} />
        </GlassCard>

        {/* Blockchain Data */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Blockchain Status</Text>
        </View>

        <GlassCard style={styles.infoCard}>
          <DetailItem label="Transaction Hash" value={credential.transactionHash} icon={Activity} />
          {credential.tokenId && (
            <>
              <View style={styles.divider} />
              <DetailItem label="Soulbound Token ID" value={`#${credential.tokenId}`} icon={Fingerprint} />
            </>
          )}
          <View style={styles.divider} />
          <DetailItem label="Block Number" value={credential.blockNumber?.toString()} icon={Box} />
          <View style={styles.divider} />
          <TouchableOpacity onPress={openEtherscan} style={styles.etherscanLink}>
            <Text style={styles.etherscanText}>
              {credential.tokenId ? 'View NFT on Explorer' : 'View Transaction on Explorer'}
            </Text>
            <ExternalLink size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </GlassCard>

        <Button 
          title="Share Digital Certificate"
          onPress={handleShare}
          style={styles.mainBtn}
          icon={<Share2 size={20} color="#fff" />}
        />
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  shareBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  badgeCard: {
    alignItems: 'center',
    paddingVertical: 30,
    marginVertical: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  credentialTitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  programName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    padding: theme.spacing.md,
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  detailLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  etherscanLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  etherscanText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  mainBtn: {
    marginTop: 30,
  },
  bottomSpacer: {
    height: 40,
  }
});

export default CredentialDetailScreen;
