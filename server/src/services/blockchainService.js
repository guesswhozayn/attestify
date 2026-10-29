const crypto = require('crypto');
const { ethers } = require('ethers');
const contractArtifact = require('../config/contractABI.json');
const SimpleMutex = require('../utils/mutex');
const { connection } = require('./queueService');

const contractABI = contractArtifact.abi || contractArtifact;

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
      this._contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, this.wallet);
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
        if (receipt?.blockNumber) {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${txHash} reverted on-chain.`);
          }
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

  async _acquireRedisLock(lockKey, ttlMs = 30000) {
    if (!connection || connection.status !== 'ready') return null;
    const token = crypto.randomUUID();
    const start = Date.now();
    while (Date.now() - start < ttlMs) {
      try {
        const res = await connection.set(lockKey, token, 'PX', ttlMs, 'NX');
        if (res === 'OK') {
          return async () => {
            const luaScript = `
              if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
              else
                return 0
              end
            `;
            try {
              await connection.eval(luaScript, 1, lockKey, token);
            } catch (e) {}
          };
        }
      } catch (err) {
        return null;
      }
      await new Promise(r => setTimeout(r, 200));
    }
    return null;
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

        this.currentNonce = freshNonce + 1;

        try {
          return await contractCall(...args, bumpedOverrides);
        } catch (retryErr) {
          this.currentNonce = null;
          throw retryErr;
        }
      }

      this.currentNonce = null;
      throw err;
    }
  }

  async _getGasOverrides(multiplier = 1.0) {
    const feeData = await this.provider.getFeeData();
    const mul = BigInt(Math.round(multiplier * 100));
    const PRIORITY_FLOOR = BigInt(3e9);
    const MAX_FEE_FLOOR = BigInt(15e9);
    const rawPriority = feeData.maxPriorityFeePerGas ?? BigInt(1e9);
    const rawMax = feeData.maxFeePerGas ?? BigInt(10e9);

    const maxPriorityFeePerGas = rawPriority * mul / 100n > PRIORITY_FLOOR
      ? rawPriority * mul / 100n : PRIORITY_FLOOR;
    const maxFeePerGas = rawMax * mul / 100n > MAX_FEE_FLOOR
      ? rawMax * mul / 100n : MAX_FEE_FLOOR;

    console.log(`[Gas] maxFeePerGas=${ethers.formatUnits(maxFeePerGas, 'gwei')} gwei, maxPriorityFeePerGas=${ethers.formatUnits(maxPriorityFeePerGas, 'gwei')} gwei`);
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  _extractGasStats(receipt) {
    const gasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice ?? 0n;
    const gasUsed = receipt.gasUsed ?? 0n;
    return {
      gasUsed: gasUsed.toString(),
      gasPrice: gasPrice.toString(),
      totalCost: (gasUsed * gasPrice).toString()
    };
  }

  async _sendContractTx(method, args) {
    let releaseDistributedLock = null;
    try {
      releaseDistributedLock = await this._acquireRedisLock('lock:blockchain:tx', 30000);
    } catch (e) {}

    await this.nonceMutex.lock();
    try {
      const gasEstimate = await method.estimateGas(...args);
      const pendingCount = await this.provider.getTransactionCount(this.wallet.address, 'pending');
      if (this.currentNonce == null || this.currentNonce < pendingCount) {
        this.currentNonce = pendingCount;
      }
      const nonce = this.currentNonce++;
      const gasOverrides = await this._getGasOverrides();

      return await this._sendWithRetry(
        method.bind(this.contract),
        args,
        { gasLimit: gasEstimate * 120n / 100n, nonce, ...gasOverrides }
      );
    } finally {
      this.nonceMutex.unlock();
      if (releaseDistributedLock) {
        await releaseDistributedLock();
      }
    }
  }

  async revokeCertificate(studentId) {
    try {
      const tx = await this._sendContractTx(this.contract.revokeCertificate, [studentId]);
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
      const args = [to, studentId, certificateHash, ipfsCID, tokenURI];
      const tx = await this._sendContractTx(this.contract.issueUnifiedCredential, args);

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

      if (!tokenId) {
        throw new Error(`SoulboundMinted event not found in receipt for ${receipt.hash}`);
      }

      return {
        transactionHash: receipt.hash,
        tokenId,
        blockNumber: receipt.blockNumber,
        status: 'success',
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
      const tx = await this._sendContractTx(this.contract.revokeToken, [tokenId]);

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
      if (error.message.includes('Credential not found')) return null;
      throw new Error(`Failed to get credential: ${error.message}`);
    }
  }

  async isIssued(studentId) {
    try {
      return await this.contract.isIssued(studentId);
    } catch (error) {
      console.warn('isIssued check error:', error.message);
      return false;
    }
  }

  async getOnChainIssuanceDetails(studentId) {
    try {
      const isIssued = await this.isIssued(studentId);
      if (!isIssued) return null;

      const cred = await this.getCredential(studentId);
      let transactionHash = null;
      let blockNumber = null;
      let tokenId = null;

      try {
        const filter = this.contract.filters.CredentialIssued(studentId);
        const events = await this.contract.queryFilter(filter);
        if (events.length > 0) {
          const event = events[events.length - 1];
          transactionHash = event.transactionHash;
          blockNumber = event.blockNumber;

          const receipt = await this.provider.getTransactionReceipt(transactionHash);
          if (receipt) {
            for (const log of receipt.logs) {
              try {
                const parsedLog = this.contract.interface.parseLog(log);
                if (parsedLog.name === 'SoulboundMinted') {
                  tokenId = parsedLog.args.tokenId.toString();
                  break;
                }
              } catch (e) {}
            }
          }
        }
      } catch (logErr) {
        console.warn('Failed to query past issuance logs:', logErr.message);
      }

      return {
        isIssued: true,
        certificateHash: cred?.certificateHash,
        ipfsCID: cred?.ipfsCID,
        transactionHash,
        blockNumber,
        tokenId
      };
    } catch (error) {
      console.error('getOnChainIssuanceDetails error:', error.message);
      return null;
    }
  }

  async verifyCredential(studentId, hash) {
    try {
      if (!studentId || !hash) return false;
      const bytes32Hash = typeof hash === 'string' && !hash.startsWith('0x') ? `0x${hash}` : hash;
      return await this.contract.verifyCredential(studentId, bytes32Hash);
    } catch (error) {
      console.error('Blockchain verify error:', error);
      return false;
    }
  }

  async getBalance(address = null) {
    try {
      const balance = await this.provider.getBalance(address || this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }

  async getNetworkStats() {
    try {
      if (!this.provider) throw new Error('Blockchain provider not initialized');
      const [blockNumber, feeData] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData()
      ]);
      return {
        blockNumber,
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0',
        connected: true
      };
    } catch (error) {
      console.error('Network stats retrieval failed:', error.message);
      if (error.code) console.error('Error Code:', error.code);
      return { blockNumber: 0, gasPrice: '0', connected: false, error: error.message };
    }
  }
}

module.exports = new BlockchainService();
