const { ethers } = require('ethers');
const contractArtifact = require('../config/contractABI.json');
const contractABI = contractArtifact.abi || contractArtifact;
const SimpleMutex = require('../utils/mutex');

class BlockchainService {
  constructor() {
    this._provider = null;
    this._wallet = null;
    this._contract = null;
    this.nonceMutex = new SimpleMutex();
    this.currentNonce = null;
  }

  get provider() {
    if (!this._provider) {
      this._provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL?.trim());
    }
    return this._provider;
  }

  get wallet() {
    if (!this._wallet) {
      this._wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY?.trim(), this.provider);
    }
    return this._wallet;
  }

  get contract() {
    if (!this._contract) {
      this._contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        contractABI,
        this.wallet
      );
    }
    return this._contract;
  }

  async _pollForReceipt(txHash, { intervalMs = 3000, timeoutMs = 240000 } = {}) {
    const start = Date.now();
    let attempt = 0;

    while (Date.now() - start < timeoutMs) {
      attempt++;
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        if (receipt && receipt.blockNumber) {
          console.log(`[Blockchain] Receipt confirmed for ${txHash} (attempt ${attempt}, ${Date.now() - start}ms)`);
          return receipt;
        }
      } catch (err) {
        console.warn(`[Blockchain] getTransactionReceipt error (attempt ${attempt}): ${err.message}`);
      }

      await new Promise(r => setTimeout(r, intervalMs));
    }

    throw new Error(
      `Transaction ${txHash} not confirmed after ${timeoutMs / 1000}s (${attempt} attempts). ` +
      `Check https://sepolia.etherscan.io/tx/${txHash} — the tx may still confirm on-chain.`
    );
  }

  async getNonce() {
    await this.nonceMutex.lock();
    try {
      if (this.currentNonce === null || this.currentNonce === undefined) {
        this.currentNonce = await this.provider.getTransactionCount(this.wallet.address, 'pending');
      }
      const nonce = this.currentNonce;
      this.currentNonce++;
      return nonce;
    } finally {
      this.nonceMutex.unlock();
    }
  }

  async _sendWithRetry(contractCall, args, overrides) {
    try {
      return await contractCall(...args, overrides);
    } catch (err) {
      if (err.code === 'REPLACEMENT_UNDERPRICED' || err.info?.error?.code === -32000) {
        console.warn('[Blockchain] Replacement underpriced — bumping gas 30% and retrying with fresh nonce...');
        await new Promise(r => setTimeout(r, 2000));
        const freshNonce = await this.provider.getTransactionCount(this.wallet.address, 'pending');
        const gasOverrides = await this._getGasOverrides(1.3);
        const bumpedOverrides = { ...overrides, nonce: freshNonce, ...gasOverrides };
        delete bumpedOverrides.gasPrice;
        console.log(`[Blockchain] Retrying with nonce=${freshNonce}, maxFeePerGas=${gasOverrides.maxFeePerGas}`);

        await this.nonceMutex.lock();
        try {
          this.currentNonce = freshNonce + 1;
        } finally {
          this.nonceMutex.unlock();
        }

        try {
          return await contractCall(...args, bumpedOverrides);
        } catch (retryErr) {
          await this.nonceMutex.lock();
          try {
            this.currentNonce = null;
          } finally {
            this.nonceMutex.unlock();
          }
          throw retryErr;
        }
      }

      await this.nonceMutex.lock();
      try {
        this.currentNonce = null;
      } finally {
        this.nonceMutex.unlock();
      }

      throw err;
    }
  }

  async _getGasOverrides(multiplier = 1.0) {
    const feeData = await this.provider.getFeeData();
    const mul = BigInt(Math.round(multiplier * 100));

    const PRIORITY_FLOOR = BigInt(3e9);
    const MAX_FEE_FLOOR  = BigInt(15e9);

    const rawPriority = feeData.maxPriorityFeePerGas ?? BigInt(1e9);
    const rawMax      = feeData.maxFeePerGas ?? BigInt(10e9);

    const maxPriorityFeePerGas = (rawPriority * mul / 100n) > PRIORITY_FLOOR
      ? (rawPriority * mul / 100n)
      : PRIORITY_FLOOR;

    const maxFeePerGas = (rawMax * mul / 100n) > MAX_FEE_FLOOR
      ? (rawMax * mul / 100n)
      : MAX_FEE_FLOOR;

    console.log(`[Gas] maxFeePerGas=${ethers.formatUnits(maxFeePerGas,'gwei')} gwei, maxPriorityFeePerGas=${ethers.formatUnits(maxPriorityFeePerGas,'gwei')} gwei`);
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  _extractGasStats(receipt) {
    const gasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice ?? 0n;
    const gasUsed = receipt.gasUsed ?? 0n;
    const totalCost = gasUsed * gasPrice;
    return {
      gasUsed: gasUsed.toString(),
      gasPrice: gasPrice.toString(),
      totalCost: totalCost.toString()
    };
  }

  async revokeCertificate(studentId) {
    try {
      const gasEstimate = await this.contract.revokeCertificate.estimateGas(studentId);
      const nonce = await this.getNonce();
      const gasOverrides = await this._getGasOverrides();

      const tx = await this._sendWithRetry(
        this.contract.revokeCertificate.bind(this.contract),
        [studentId],
        { gasLimit: gasEstimate * 120n / 100n, nonce, ...gasOverrides }
      );

      console.log('Revoke transaction sent:', tx.hash);
      const receipt = await this._pollForReceipt(tx.hash);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        ...this._extractGasStats(receipt)
      };

    } catch (error) {
      console.error('Blockchain revoke error:', error);
      throw new Error(`Revocation failed: ${error.message}`);
    }
  }

  async issueUnifiedCredential(to, studentId, certificateHash, ipfsCID, tokenURI) {
    try {
      console.log('Minting Unified Credential:', { to, studentId, certificateHash });

      const gasEstimate = await this.contract.issueUnifiedCredential.estimateGas(
        to,
        studentId,
        certificateHash,
        ipfsCID,
        tokenURI
      );
      const nonce = await this.getNonce();
      const gasOverrides = await this._getGasOverrides();

      const tx = await this._sendWithRetry(
        this.contract.issueUnifiedCredential.bind(this.contract),
        [to, studentId, certificateHash, ipfsCID, tokenURI],
        { gasLimit: gasEstimate * 120n / 100n, nonce, ...gasOverrides }
      );

      console.log('Unified Mint transaction sent:', tx.hash);
      const receipt = await this._pollForReceipt(tx.hash);
      console.log('Unified Mint confirmed:', receipt.hash);

      let tokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog.name === 'SoulboundMinted') {
            tokenId = parsedLog.args.tokenId.toString();
            break;
          }
        } catch (e) { }
      }

      return {
        transactionHash: receipt.hash,
        tokenId,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'success' : 'failed',
        ...this._extractGasStats(receipt)
      };

    } catch (error) {
      console.error('Unified Mint error:', error);
      throw new Error(`Unified Mint failed: ${error.message}`);
    }
  }



  async revokeSoulboundCredential(tokenId) {
    try {
      console.log('Revoking Soulbound Token:', tokenId);
      const gasEstimate = await this.contract.revokeToken.estimateGas(tokenId);
      const nonce = await this.getNonce();
      const gasOverrides = await this._getGasOverrides();

      const tx = await this._sendWithRetry(
        this.contract.revokeToken.bind(this.contract),
        [tokenId],
        { gasLimit: gasEstimate * 120n / 100n, nonce, ...gasOverrides }
      );

      console.log('Revoke SBT transaction sent:', tx.hash);
      const receipt = await this._pollForReceipt(tx.hash);

      return {
        transactionHash: receipt.hash,
        status: 'revoked',
        ...this._extractGasStats(receipt)
      };

    } catch (error) {
      console.error('SBT Revoke error:', error);
      throw new Error(`SBT Revoke failed: ${error.message}`);
    }
  }

  async getCredential(studentId) {
    try {
      const result = await this.contract.getCredential(studentId);

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

  async verifyCredential(studentId, hash) {
    try {
      return await this.contract.verifyCredential(studentId, hash);
    } catch (error) {
      console.error('Blockchain verify error:', error);
      return false;
    }
  }

  async getBalance(address = null) {
    try {
      const targetAddress = address || this.wallet.address;
      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }

  async getNetworkStats() {
    try {
      if (!this.provider) {
          throw new Error('Blockchain provider not initialized');
      }
      const blockNumber = await this.provider.getBlockNumber();
      const feeData = await this.provider.getFeeData();
      return {
        blockNumber,
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0',
        connected: true
      };
    } catch (error) {
      console.error('Network stats retrieval failed:', error.message);
      if (error.code) console.error('Error Code:', error.code);
      return {
        blockNumber: 0,
        gasPrice: '0',
        connected: false,
        error: error.message
      };
    }
  }
}

module.exports = new BlockchainService();
