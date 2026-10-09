export const generateFileHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const hashToBytes32 = (hash) => hash.startsWith('0x') ? hash : `0x${hash}`;

export const validateHash = (hash) => /^0x[a-fA-F0-9]{64}$/.test(hash);
