const { ethers } = require('ethers');
const contractArtifact = require('../config/contractABI.json');
const contractABI = contractArtifact.abi || contractArtifact;

class SimpleMutex {
  constructor() {
    this._queue = [];
    this._locked = false;
  }

  lock() {
    return new Promise((resolve) => {
      if (this._locked) {
        this._queue.push(resolve);
      } else {
        this._locked = true;
        resolve();
      }
    });
  }

  unlock() {
    if (this._queue.length > 0) {
      const nextResolve = this._queue.shift();
      nextResolve();
    } else {
      this._locked = false;
    }
  }
}

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      this.wallet
    );
    this.nonceMutex = new SimpleMutex();
    this.currentNonce = null;
  }

  async getNonce() {
    await this.nonceMutex.lock();
    try {
      if (this.currentNonce === null) {
        this.currentNonce = await this.provider.getTransactionCount(this.wallet.address, "pending");
      }
      const nonce = this.currentNonce;
      this.currentNonce++;
      return nonce;
    } finally {
      this.nonceMutex.unlock();
    }
  }

  async issueCertificate(registrationNumber, certificateHash, ipfsCID) {
    try {
      console.log('Issuing certificate on blockchain:', { registrationNumber, certificateHash, ipfsCID });

      // Estimate gas
      const gasEstimate = await this.contract.issueCertificate.estimateGas(
        registrationNumber,
        certificateHash,
        ipfsCID
      );

      // Get managed nonce
      const nonce = await this.getNonce();

      // Send transaction with 20% buffer
      const tx = await this.contract.issueCertificate(
        registrationNumber,
        certificateHash,
        ipfsCID,
        {
          gasLimit: gasEstimate * 120n / 100n,
          nonce
        }
      );

      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('Transaction confirmed:', receipt.hash);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice.toString(),
        totalCost: (receipt.gasUsed * receipt.gasPrice).toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
      };

    } catch (error) {
      console.error('Blockchain issue error:', error);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  async revokeCertificate(registrationNumber) {
    try {
      const gasEstimate = await this.contract.revokeCertificate.estimateGas(registrationNumber);
      
      const nonce = await this.getNonce();

      const tx = await this.contract.revokeCertificate(registrationNumber, {
        gasLimit: gasEstimate * 120n / 100n,
        nonce
      });

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice.toString(),
        totalCost: (receipt.gasUsed * receipt.gasPrice).toString()
      };

    } catch (error) {
      console.error('Blockchain revoke error:', error);
      throw new Error(`Revocation failed: ${error.message}`);
    }
  }

  async issueSoulboundCredential(to, tokenURI) {
    try {
      console.log('Minting Soulbound Token:', { to, tokenURI });

      const gasEstimate = await this.contract.safeMint.estimateGas(to, tokenURI);
      
      const nonce = await this.getNonce();

      const tx = await this.contract.safeMint(to, tokenURI, {
        gasLimit: gasEstimate * 120n / 100n,
        nonce
      });

      console.log('Mint transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Mint confirmed:', receipt.hash);

      // find TokenId from events?
      // The event is SoulboundMinted(address indexed to, uint256 indexed tokenId, string uri);
      // We can parse logs if needed, but for now returning receipt is fine.
      
      let tokenId = null;
      for (const log of receipt.logs) {
        try {
            const parsedLog = this.contract.interface.parseLog(log);
            if (parsedLog.name === 'SoulboundMinted') {
                tokenId = parsedLog.args.tokenId.toString();
                break;
            }
        } catch (e) {
            // ignore unrelated logs
        }
      }

      return {
        transactionHash: receipt.hash,
        tokenId: tokenId,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'success' : 'failed'
      };

    } catch (error) {
      console.error('SBT Mint error:', error);
      throw new Error(`SBT Mint failed: ${error.message}`);
    }
  }

  async revokeSoulboundCredential(tokenId) {
    try {
       console.log('Revoking Soulbound Token:', tokenId);
       const gasEstimate = await this.contract.revokeToken.estimateGas(tokenId);
       
       const nonce = await this.getNonce();

       const tx = await this.contract.revokeToken(tokenId, {
         gasLimit: gasEstimate * 120n / 100n,
         nonce
       });

       const receipt = await tx.wait();
       
       return {
         transactionHash: receipt.hash,
         status: 'revoked'
       };
    } catch (error) {
       console.error('SBT Revoke error:', error);
       throw new Error(`SBT Revoke failed: ${error.message}`);
    }
  }

  async getCredential(registrationNumber) {
    try {
      const result = await this.contract.getCredential(registrationNumber);
      
      return {
        certificateHash: result[0],
        ipfsCID: result[1],
        issuedAt: new Date(Number(result[2]) * 1000),
        isRevoked: result[3]
      };

    } catch (error) {
      if (error.message.includes('Credential not found')) {
        return null;
      }
      throw new Error(`Failed to get credential: ${error.message}`);
    }
  }

  async verifyCredential(registrationNumber, hash) {
    try {
      return await this.contract.verifyCredential(registrationNumber, hash);
    } catch (error) {
      console.error('Blockchain verify error:', error);
      return false;
    }
  }

  async getBalance(address = null) {
    try {
      const targetAddress = address || this.wallet.address;
      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance); // Correct usage for v6, or check ethers version
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }

  async getNetworkStats() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const feeData = await this.provider.getFeeData();
      return {
        blockNumber,
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0',
        connected: true
      };
    } catch (error) {
      console.error('Network stats error:', error);
      return {
        blockNumber: 0,
        gasPrice: '0',
        connected: false
      };
    }
  }
}

module.exports = new BlockchainService();
