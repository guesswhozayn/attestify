const { ethers } = require('ethers');
const contractABI = require('../config/contractABI.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      this.wallet
    );
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

      // Send transaction with 20% buffer
      const tx = await this.contract.issueCertificate(
        registrationNumber,
        certificateHash,
        ipfsCID,
        {
          gasLimit: gasEstimate * 120n / 100n
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
      
      const tx = await this.contract.revokeCertificate(registrationNumber, {
        gasLimit: gasEstimate * 120n / 100n
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

  async getBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }
}

module.exports = new BlockchainService();
