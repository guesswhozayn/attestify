import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Share2,
  X
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../theme/theme';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Input from '../components/Input';

const VerificationScreen = () => {
  const [credentialId, setCredentialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleVerify = async (id?: string) => {
    let verificationId = id || credentialId;
    if (!verificationId) return;

    // Extract ID if it's a URL (from QR scanner)
    if (verificationId.includes('/verify/')) {
      const parts = verificationId.split('/verify/');
      verificationId = parts[parts.length - 1].split('/')[0].trim();
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    setIsScannerVisible(false);

    try {
      const response = await api.get(`/credentials/verify/${verificationId}`);
      setResult(response.data.credential);
      setCredentialId(verificationId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. ID might be invalid.');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    if (!permission || permission.status !== 'granted') {
      const result = await requestPermission();
      if (!result.granted) {
        setError('Camera permission is required to scan QR codes.');
        return;
      }
    }
    setIsScannerVisible(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data) {
      handleVerify(data);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {isScannerVisible ? (
        <View style={{ flex: 1 }}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Certificate QR</Text>
            <TouchableOpacity 
              onPress={() => setIsScannerVisible(false)}
              style={styles.closeBtn}
            >
              <X size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraContainer}>
            <CameraView 
              style={styles.camera} 
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.middleRow}>
                <View style={styles.unfocusedContainer} />
                <View style={styles.focusedContainer} />
                <View style={styles.unfocusedContainer} />
              </View>
              <View style={styles.unfocusedContainer} />
            </View>
          </View>

          <View style={styles.scannerFooter}>
            <Text style={styles.scannerHint}>Align the QR code within the frame</Text>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Verify Credential</Text>
              <Text style={styles.subtitle}>Authenticate blockchain records instantly.</Text>
            </View>

            {/* Verification Search */}
            <GlassCard style={styles.searchCard}>
              <Input
                label="Credential ID / Verification Hash"
                placeholder="Enter unique ID..."
                value={credentialId}
                onChangeText={setCredentialId}
                icon={<Search size={20} color={theme.colors.textDim} />}
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <View style={styles.btnRow}>
                <Button
                  title="Verify Record"
                  onPress={() => handleVerify()}
                  loading={loading}
                  style={{ flex: 2 }}
                />
                <TouchableOpacity style={styles.scanBtn} onPress={startScanner}>
                  <QrCode size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* Results Area */}
            {loading && (
              <View style={styles.statusArea}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={styles.statusText}>Searching blockchain...</Text>
              </View>
            )}

            {error ? (
              <GlassCard style={[styles.resultCard, styles.errorCard]}>
                 <AlertCircle size={24} color={theme.colors.error} />
                 <Text style={styles.errorText}>{error}</Text>
              </GlassCard>
            ) : null}

            {result && (
              <GlassCard style={styles.resultCard}>
                <View style={styles.successHeader}>
                  <CheckCircle2 color={theme.colors.success} size={28} />
                  <Text style={styles.successTitle}>Verified Authenticity</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                   <Text style={styles.detailLabel}>Student Name</Text>
                   <Text style={styles.detailValue}>{result.studentName}</Text>
                </View>
                <View style={styles.detailRow}>
                   <Text style={styles.detailLabel}>Credential Type</Text>
                   <Text style={styles.detailValue}>{result.type}</Text>
                </View>
                <View style={styles.detailRow}>
                   <Text style={styles.detailLabel}>Institution</Text>
                   <Text style={styles.detailValue}>{result.institutionName}</Text>
                </View>
                <View style={styles.detailRow}>
                   <Text style={styles.detailLabel}>Date Issued</Text>
                   <Text style={styles.detailValue}>{new Date(result.createdAt).toLocaleDateString()}</Text>
                </View>
                {result.tokenId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Soulbound Token ID</Text>
                    <Text style={styles.detailValue}>#{result.tokenId}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.viewFullBtn}
                  onPress={() => {
                    if (result.ipfsCID) {
                      const url = `https://gateway.pinata.cloud/ipfs/${result.ipfsCID}`;
                      Linking.openURL(url).catch(() => {
                        Alert.alert('Error', 'Could not open certificate link');
                      });
                    }
                  }}
                >
                  <Text style={styles.viewFullText}>View Full Certificate</Text>
                  <Share2 size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </GlassCard>
            )}

            {!loading && !result && !error && (
              <View style={styles.tipContainer}>
                 <Text style={styles.tipTitle}>Quick Tip</Text>
                 <Text style={styles.tipText}>
                   You can find the verification ID on the bottom of any official Attestify certificate.
                 </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  searchCard: {
    padding: theme.spacing.lg,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  scanBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
  },
  statusArea: {
    alignItems: 'center',
    padding: 40,
  },
  statusText: {
    color: theme.colors.textMuted,
    marginTop: 12,
  },
  resultCard: {
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  errorCard: {
    borderLeftColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: theme.colors.error,
    fontWeight: '600',
    flex: 1,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  successTitle: {
    color: theme.colors.success,
    fontSize: 20,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: theme.colors.textDim,
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  viewFullText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  tipContainer: {
    marginTop: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  tipTitle: {
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  // Scanner Styles
  scannerHeader: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#000',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerFooter: {
    height: 100,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: 20,
  },
  scannerHint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  }
});

export default VerificationScreen;
