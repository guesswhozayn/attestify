import { ethers } from 'ethers';

// Contract ABI - Essential functions only
const CONTRACT_ABI = [
  // Read functions
  "function getCredential(string memory _studentId) public view returns (bytes32 certificateHash, string memory ipfsCID, uint256 issuedAt, bool isRevoked)",
  "function verifyCredential(string memory _studentId, bytes32 _hash) public view returns (bool)",
  "function isIssued(string memory _studentId) public view returns (bool)",
  
  // Write functions (only owner)
  "function issueCertificate(string memory _studentId, bytes32 _certificateHash, string memory _ipfsCID) public",
  "function revokeCertificate(string memory _studentId) public",
  
  // Events
  "event CredentialIssued(string indexed studentId, bytes32 certificateHash, string ipfsCID, uint256 timestamp)",
  "event CredentialRevoked(string indexed studentId, uint256 timestamp)"
];

// Blockchain configuration
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in decimal
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    this.rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL;
    
    // Initialize read-only provider
    if (this.rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      this.contract = new ethers.Contract(
        this.contractAddress,
        CONTRACT_ABI,
        this.provider
      );
    }
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  // Get current network
  async getCurrentNetwork() {
    if (!this.provider) return null;
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name
      };
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }

  // Check if on Sepolia network
  async isOnSepoliaNetwork() {
    const network = await this.getCurrentNetwork();
    return network && network.chainId === SEPOLIA_CHAIN_ID_DECIMAL;
  }

  // Switch to Sepolia network
  async switchToSepolia() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
          return true;
        } catch {
          throw new Error('Failed to add Sepolia network to MetaMask');
        }
      }
      throw new Error('Failed to switch to Sepolia network');
    }
  }

  // Connect wallet
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Check network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DECIMAL) {
        await this.switchToSepolia();
        // Reload provider after network switch
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
      }

      // Initialize contract with signer
      this.contract = new ethers.Contract(
        this.contractAddress,
        CONTRACT_ABI,
        this.signer
      );

      const address = await this.signer.getAddress();
      return address;

    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  // Get connected account
  async getAccount() {
    if (!this.signer) {
      return null;
    }
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  // Get account balance
  async getBalance(address) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Issue certificate (requires connected wallet)
  async issueCertificate(studentId, certificateHash, ipfsCID) {
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      console.log('Issuing certificate:', { studentId, certificateHash, ipfsCID });

      // Estimate gas
      const gasEstimate = await this.contract.issueCertificate.estimateGas(
        studentId,
        certificateHash,
        ipfsCID
      );

      // Send transaction with 20% buffer
      const tx = await this.contract.issueCertificate(
        studentId,
        certificateHash,
        ipfsCID,
        {
          gasLimit: gasEstimate * 120n / 100n
        }
      );

      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('Transaction confirmed:', receipt);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
      };

    } catch (error) {
      console.error('Issue certificate error:', error);
      
      // Parse error message
      let errorMessage = 'Failed to issue certificate';
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.message.includes('already issued')) {
        errorMessage = 'Certificate already issued for this student';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Revoke certificate
  async revokeCertificate(studentId) {
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      const gasEstimate = await this.contract.revokeCertificate.estimateGas(studentId);
      
      const tx = await this.contract.revokeCertificate(studentId, {
        gasLimit: gasEstimate * 120n / 100n
      });

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('Revoke certificate error:', error);
      throw new Error(`Failed to revoke certificate: ${error.message}`);
    }
  }

  // Get credential (read-only, no wallet needed)
  async getCredential(studentId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await this.contract.getCredential(studentId);
      
      return {
        certificateHash: result[0],
        ipfsCID: result[1],
        issuedAt: new Date(Number(result[2]) * 1000),
        isRevoked: result[3]
      };

    } catch (error) {
      console.error('Get credential error:', error);
      
      if (error.message.includes('Credential not found')) {
        return null;
      }
      
      throw new Error(`Failed to get credential: ${error.message}`);
    }
  }

  // Verify credential (read-only, no wallet needed)
  async verifyCredential(studentId, hash) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const isValid = await this.contract.verifyCredential(studentId, hash);
      return isValid;
    } catch (error) {
      console.error('Verify credential error:', error);
      return false;
    }
  }

  // Check if credential is issued (read-only)
  async isCredentialIssued(studentId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.isIssued(studentId);
    } catch (error) {
      console.error('Check issued error:', error);
      return false;
    }
  }

  // Get transaction details
  async getTransaction(txHash) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        transaction: tx,
        receipt: receipt,
        confirmations: receipt ? await receipt.confirmations() : 0
      };
    } catch (error) {
      console.error('Get transaction error:', error);
      throw error;
    }
  }

  // Get Etherscan URL
  getEtherscanUrl(txHash) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  getEtherscanAddressUrl(address) {
    return `https://sepolia.etherscan.io/address/${address}`;
  }

  // Listen to contract events
  onCredentialIssued(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    this.contract.on('CredentialIssued', (studentId, certificateHash, ipfsCID, timestamp, event) => {
      callback({
        studentId,
        certificateHash,
        ipfsCID,
        timestamp: new Date(Number(timestamp) * 1000),
        transactionHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber
      });
    });
  }

  onCredentialRevoked(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    this.contract.on('CredentialRevoked', (studentId, timestamp, event) => {
      callback({
        studentId,
        timestamp: new Date(Number(timestamp) * 1000),
        transactionHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber
      });
    });
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  // Disconnect wallet
  disconnect() {
    this.signer = null;
    // Keep provider for read-only operations
    if (this.rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      this.contract = new ethers.Contract(
        this.contractAddress,
        CONTRACT_ABI,
        this.provider
      );
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;
