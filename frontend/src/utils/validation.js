export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateStudentId = (id) => {
  return id && id.length >= 3;
};

export const validateWalletAddress = (address) => {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  if (!file) return { valid: false, error: 'No file selected' };
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
  }
  return { valid: true };
};
