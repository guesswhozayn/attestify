export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  INSTITUTE: 'INSTITUTE',
  STUDENT: 'STUDENT',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const CERTIFICATE_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  PENDING: 'pending',
};

export const AUDIT_ACTIONS = {
  CREDENTIAL_ISSUED: 'CREDENTIAL_ISSUED',
  CREDENTIAL_REVOKED: 'CREDENTIAL_REVOKED',
  ADMIN_CREATED: 'ADMIN_CREATED',
  ADMIN_DELETED: 'ADMIN_DELETED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
};

export const BLOCKCHAIN_NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7',
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  MAINNET: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
  },
};

export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];
