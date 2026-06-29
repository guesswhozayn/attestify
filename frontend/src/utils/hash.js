export const generateFileHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve('0x' + hashHex);
      } catch (error) {
        reject(error);
      }
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
