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

export const getVerificationBaseUrl = () => {
  const envUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_FRONTEND_URL;
  if (envUrl && typeof envUrl === 'string') {
    try {
      const parsed = new URL(envUrl);
      if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        return parsed.origin;
      }
    } catch {
      void 0;
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    try {
      const parsed = new URL(window.location.origin);
      if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        return parsed.origin;
      }
    } catch {
      void 0;
    }
  }

  return 'https://attestify-alpha.vercel.app';
};
