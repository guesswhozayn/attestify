export const getCredentialMeta = (credential) => {
  if (!credential) return null;
  const isTranscript = credential.type === 'TRANSCRIPT';
  return {
    isTranscript,
    metadata: isTranscript ? credential.transcriptData : credential.certificationData,
    iconColor: isTranscript ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    typeLabel: isTranscript ? 'Transcript' : 'Certification',
    ledgerLabel: isTranscript ? 'Academic Ledger' : 'Certification Registry',
  };
};
