import { sha256 } from 'js-sha256';

export const generateFileHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      const hash = sha256(uint8Array);
      resolve('0x' + hash);
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const hashToBytes32 = (hash) => {
  if (hash.startsWith('0x')) {
    return hash;
  }
  return '0x' + hash;
};

export const validateHash = (hash) => {
  const regex = /^0x[a-fA-F0-9]{64}$/;
  return regex.test(hash);
};
